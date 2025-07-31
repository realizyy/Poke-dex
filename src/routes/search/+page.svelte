<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { goto } from '$app/navigation';
	import { browser } from '$app/environment';
	import type { PageData } from './$types';
	import type { Pokemon, SearchFilters, Team } from '$lib/types';
	import { teamStore, currentTeam } from '$lib/stores/team';
	import SearchFilter from '../../components/search/SearchFilter.svelte';
	import PokemonCard from '../../components/ui/PokemonCard.svelte';
	import LoadingSpinner from '../../components/ui/LoadingSpinner.svelte';
	import { PokemonService } from '$lib/services/pokemon-service';
	
	export let data: PageData;
	
	let searchQuery = data.query || '';
	let filters: SearchFilters = data.filters || { types: [], generations: [] };
	let pokemons: Pokemon[] = data.pokemons || [];
	let hasMore = data.hasMore || false;
	let loading = false;
	let loadingMore = false;
	let offset = data.offset || 0;
	let sortBy: 'id' | 'name' | 'stats' = 'id';
	let sortOrder: 'asc' | 'desc' = 'asc';
	let selectedTeam: string | null = null;
	
	$: teams = $teamStore;
	
	// Load teams on mount
	onMount(() => {
		teamStore.loadTeams();
	});
	
	// Handle search and filter changes
	async function handleSearch(event: CustomEvent<{ query: string; filters: SearchFilters }>) {
		loading = true;
		searchQuery = event.detail.query;
		filters = event.detail.filters;
		offset = 0;
		
		try {
			let result;
			if (searchQuery) {
				const searchResults = await PokemonService.searchPokemon(searchQuery, 50);
				result = {
					pokemons: searchResults,
					hasMore: searchResults.length >= 50
				};
			} else {
				result = await PokemonService.fetchPokemonWithFilters(filters, 50, 0);
			}
			
			pokemons = result.pokemons;
			hasMore = result.hasMore;
			
			// Update URL
			updateUrl();
		} catch (error) {
			console.error('Search error:', error);
			pokemons = [];
			hasMore = false;
		} finally {
			loading = false;
		}
	}
	
	// Handle clear filters
	function handleClear() {
		searchQuery = '';
		filters = { types: [], generations: [] };
		pokemons = [];
		hasMore = false;
		offset = 0;
		updateUrl();
	}
	
	// Load more Pokemon (infinite scroll)
	async function loadMore() {
		if (loadingMore || !hasMore) return;
		
		loadingMore = true;
		offset += 50;
		
		try {
			let result;
			if (searchQuery) {
				// For search, we need to implement pagination differently
				const searchResults = await PokemonService.searchPokemon(searchQuery, 50 + offset);
				result = {
					pokemons: searchResults.slice(offset),
					hasMore: searchResults.length > offset + 50
				};
			} else {
				result = await PokemonService.fetchPokemonWithFilters(filters, 50, offset);
			}
			
			pokemons = [...pokemons, ...result.pokemons];
			hasMore = result.hasMore;
		} catch (error) {
			console.error('Load more error:', error);
		} finally {
			loadingMore = false;
		}
	}
	
	// Update URL with current search params
	function updateUrl() {
		if (!browser) return;
		
		const params = new URLSearchParams();
		if (searchQuery) params.set('q', searchQuery);
		if (filters.types.length > 0) params.set('types', filters.types.join(','));
		if (filters.generations.length > 0) params.set('generations', filters.generations.join(','));
		if (offset > 0) params.set('offset', offset.toString());
		
		const url = `/search${params.toString() ? '?' + params.toString() : ''}`;
		goto(url, { replaceState: true });
	}
	
	// Sort Pokemon
	function sortPokemon(pokemon: Pokemon[]): Pokemon[] {
		return [...pokemon].sort((a, b) => {
			let comparison = 0;
			
			switch (sortBy) {
				case 'id':
					comparison = a.id - b.id;
					break;
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'stats':
					const aTotal = a.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
					const bTotal = b.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
					comparison = aTotal - bTotal;
					break;
			}
			
			return sortOrder === 'desc' ? -comparison : comparison;
		});
	}
	
	// Add Pokemon to team
	function addToTeam(pokemon: Pokemon) {
		if (selectedTeam) {
			teamStore.addPokemonToTeam(selectedTeam, pokemon);
		}
	}
	
	// Infinite scroll handler
	function handleScroll() {
		if (browser && !loadingMore && hasMore) {
			const scrolled = window.scrollY;
			const viewHeight = window.innerHeight;
			const fullHeight = document.body.scrollHeight;
			
			if (scrolled + viewHeight + 200 >= fullHeight) {
				loadMore();
			}
		}
	}
	
	onMount(() => {
		if (browser) {
			window.addEventListener('scroll', handleScroll);
			return () => window.removeEventListener('scroll', handleScroll);
		}
	});
	
	$: sortedPokemon = sortPokemon(pokemons);
</script>

<svelte:head>
	<title>Search Pokémon - Pokédx</title>
	<meta name="description" content="Search and filter through all Pokémon with advanced filters including type, generation, and stats." />
</svelte:head>

<!-- Search and Filters -->
<div class="mb-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
	<SearchFilter 
		bind:searchQuery 
		bind:filters 
		on:search={handleSearch}
		on:clear={handleClear}
	/>
</div>

<!-- Results Header -->
<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
	<div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
		<div class="flex items-center gap-4">
			<h2 class="text-xl font-semibold theme-text">
				Search Results
				{#if pokemons.length > 0}
					<span class="theme-text-secondary">({pokemons.length} found)</span>
				{/if}
			</h2>
			
			{#if loading}
				<LoadingSpinner size="sm" text="" showText={false} />
			{/if}
		</div>
		
		<div class="flex items-center gap-4">
			<!-- Sort Controls -->
			<div class="flex items-center gap-2">
				<label for="sort-select" class="text-sm font-medium theme-text">Sort by:</label>
				<select 
					id="sort-select"
					bind:value={sortBy}
					class="px-3 py-2 rounded-lg theme-border theme-bg-secondary theme-text text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
					style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
				>
					<option value="id">Pokédx #</option>
					<option value="name">Name</option>
					<option value="stats">Total Stats</option>
				</select>
				<button
					on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
					class="p-2 rounded-lg theme-border theme-bg-secondary hover:theme-bg-tertiary transition-colors"
					style="background-color: var(--bg-secondary); border-color: var(--border-color);"
					title="Toggle sort order"
					aria-label="Toggle sort order"
				>
					<svg class="w-4 h-4 theme-text-secondary {sortOrder === 'desc' ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
					</svg>
				</button>
			</div>
			
			<!-- Team Selector -->
			{#if teams.length > 0}
				<div class="flex items-center gap-2">
					<label for="team-select" class="text-sm font-medium theme-text">Add to team:</label>
					<select 
						id="team-select"
						bind:value={selectedTeam}
						class="px-3 py-2 rounded-lg theme-border theme-bg-secondary theme-text text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
						style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
					>
						<option value={null}>Select team...</option>
						{#each teams as team}
							<option value={team.id} disabled={team.pokemons.length >= 6}>
								{team.name} ({team.pokemons.length}/6)
							</option>
						{/each}
					</select>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Results Grid -->
	{#if loading && pokemons.length === 0}
		<div class="flex justify-center items-center h-64">
			<LoadingSpinner 
				size="lg" 
				text="Searching Pokédx..." 
				showText={true}
			/>
		</div>
	{:else if pokemons.length === 0}
		<div class="text-center py-12">
			<svg class="mx-auto h-12 w-12 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
			</svg>
			<h3 class="mt-2 text-sm font-medium theme-text">No Pokémon found</h3>
			<p class="mt-1 text-sm theme-text-secondary">
				Try adjusting your search criteria or clearing filters.
			</p>
		</div>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
			{#each sortedPokemon as pokemon (pokemon.id)}
				<PokemonCard 
					{pokemon} 
					showStats={true}
					showAddToTeam={selectedTeam !== null}
					onClick={() => goto(`/pokemon/${pokemon.name}`)}
				>
					<div slot="add-to-team">
						{#if selectedTeam}
							<button
								on:click|stopPropagation={() => addToTeam(pokemon)}
								class="w-full px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
								disabled={teams.find((t: Team) => t.id === selectedTeam)?.pokemons.length! >= 6}
							>
								Add to Team
							</button>
						{/if}
					</div>
				</PokemonCard>
			{/each}
		</div>
		
		<!-- Load More / Loading More -->
		{#if hasMore}
			<div class="text-center mt-8">
				{#if loadingMore}
					<div class="flex justify-center items-center py-8">
						<LoadingSpinner 
							size="sm" 
							text="Loading more Pokémon..." 
							showText={true}
						/>
					</div>
				{:else}
					<button
						on:click={loadMore}
						class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
					>
						Load More Pokémon
					</button>
				{/if}
			</div>
		{:else if pokemons.length > 0}
			<div class="text-center py-8">
				<p class="theme-text-secondary">
					You've seen all the Pokémon matching your criteria!
				</p>
			</div>
		{/if}
	{/if}
</div>