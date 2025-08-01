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
	let pokemons: Pokemon[] = [];
	let hasMore = false;
	let loading = false;
	let loadingMore = false;
	let offset = 0;
	let sortBy: 'id' | 'name' | 'stats' = 'id';
	let sortOrder: 'asc' | 'desc' = 'asc';
	let selectedTeam: string | null = null;
	let hasSearched = false;
	let totalResults = 0;
	
	$: teams = $teamStore;
	
	onMount(() => {
		teamStore.loadTeams();
	});
	
	async function handleSearch(event: CustomEvent<{ query: string; filters: SearchFilters }>) {
		loading = true;
		searchQuery = event.detail.query;
		filters = event.detail.filters;
		offset = 0;
		hasSearched = true;
		
		try {
			let result;
			if (searchQuery) {
				const searchResults = await PokemonService.searchPokemon(searchQuery, 20);
				result = {
					pokemons: searchResults,
					hasMore: searchResults.length >= 20,
					totalResults: searchResults.length
				};
			} else {
				result = await PokemonService.fetchPokemonWithFilters(filters, 20, 0);
				result = {
					...result,
					totalResults: result.pokemons.length
				};
			}
			
			pokemons = result.pokemons;
			hasMore = result.hasMore;
			totalResults = result.totalResults;
			updateUrl();
		} catch (error) {
			console.error('Search error:', error);
			pokemons = [];
			hasMore = false;
			totalResults = 0;
		} finally {
			loading = false;
		}
	}
	
	function handleClear() {
		searchQuery = '';
		filters = { types: [], generations: [] };
		pokemons = [];
		hasMore = false;
		offset = 0;
		hasSearched = false;
		totalResults = 0;
		updateUrl();
	}
	
	async function loadMore() {
		if (loadingMore || !hasMore) return;
		
		loadingMore = true;
		offset += 20;
		
		try {
			let result: { pokemons: Pokemon[]; hasMore: boolean; totalResults: number };
			if (searchQuery) {
				const searchResults = await PokemonService.searchPokemon(searchQuery, 20 + offset);
				result = {
					pokemons: searchResults.slice(offset),
					hasMore: searchResults.length > offset + 20,
					totalResults: searchResults.length
				};
			} else {
				const filterResult = await PokemonService.fetchPokemonWithFilters(filters, 20, offset);
				result = {
					pokemons: filterResult.pokemons,
					hasMore: filterResult.hasMore,
					totalResults: filterResult.pokemons.length + pokemons.length
				};
			}
			
			pokemons = [...pokemons, ...result.pokemons];
			hasMore = result.hasMore;
			totalResults = result.totalResults;
		} catch (error) {
			console.error('Load more error:', error);
		} finally {
			loadingMore = false;
		}
	}
	
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
	
	function addToTeam(pokemon: Pokemon) {
		if (selectedTeam) {
			teamStore.addPokemonToTeam(selectedTeam, pokemon);
		}
	}
	
	$: sortedPokemon = sortPokemon(pokemons);
</script>

<svelte:head>
	<title>Search Pokémon - Pokédx</title>
	<meta name="description" content="Search and filter through all Pokémon with advanced filters including type, generation, and stats." />
</svelte:head>

<div class="min-h-screen theme-bg" style="background-color: var(--bg-main);">
	<!-- Search Header -->
	<div class="sticky top-0 z-40 theme-bg theme-border-b" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<SearchFilter 
				bind:searchQuery 
				bind:filters 
				on:search={handleSearch}
				on:clear={handleClear}
			/>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
		{#if !hasSearched}
			<!-- Welcome State -->
			<div class="text-center py-12">
				<div class="max-w-md mx-auto">
					<div class="mb-6">
						<svg class="mx-auto h-16 w-16 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
					<h2 class="text-2xl font-bold theme-text mb-2">Search Pokémon</h2>
					<p class="text-sm theme-text-secondary mb-6">
						Enter a Pokémon name or use filters to find your favorite Pokémon
					</p>
					<div class="flex flex-wrap justify-center gap-2">
						<button 
							on:click={() => {
								searchQuery = 'pikachu';
								handleSearch({ detail: { query: 'pikachu', filters } } as any);
							}}
							class="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-sm font-medium transition-colors"
						>
							Try "Pikachu"
						</button>
						<button 
							on:click={() => {
								searchQuery = 'charizard';
								handleSearch({ detail: { query: 'charizard', filters } } as any);
							}}
							class="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors"
						>
							Try "Charizard"
						</button>
						<button 
							on:click={() => {
								searchQuery = 'bulbasaur';
								handleSearch({ detail: { query: 'bulbasaur', filters } } as any);
							}}
							class="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
						>
							Try "Bulbasaur"
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Search Results -->
			<div class="space-y-6">
				<!-- Results Header -->
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
					<div class="flex items-center gap-3">
						<div class="flex items-center gap-2">
							<svg class="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
							<h2 class="text-lg font-semibold theme-text">Search Results</h2>
						</div>
						
						{#if pokemons.length > 0}
							<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
								{pokemons.length} found
							</span>
						{/if}
						
						{#if loading}
							<LoadingSpinner size="sm" text="" showText={false} />
						{/if}
					</div>
					
					<!-- Compact Controls -->
					<div class="flex items-center gap-3">
						<!-- Sort Controls -->
						<div class="flex items-center gap-2">
							<select 
								bind:value={sortBy}
								class="px-3 py-1.5 rounded-md theme-border theme-bg-secondary theme-text text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
								style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
							>
								<option value="id">#</option>
								<option value="name">Name</option>
								<option value="stats">Stats</option>
							</select>
							<button
								on:click={() => sortOrder = sortOrder === 'asc' ? 'desc' : 'asc'}
								class="p-1.5 rounded-md theme-border theme-bg-secondary hover:theme-bg-tertiary transition-colors"
								style="background-color: var(--bg-secondary); border-color: var(--border-color);"
								title="Toggle sort order"
								aria-label="Toggle sort order"
							>
								<svg class="w-3 h-3 theme-text-secondary transition-transform duration-200 {sortOrder === 'desc' ? 'rotate-180' : ''}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
								</svg>
							</button>
						</div>
						
						<!-- Team Selector -->
						{#if teams.length > 0}
							<select 
								bind:value={selectedTeam}
								class="px-3 py-1.5 rounded-md theme-border theme-bg-secondary theme-text text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
								style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
							>
								<option value={null}>Add to team...</option>
								{#each teams as team}
									<option value={team.id} disabled={team.pokemons.length >= 6}>
										{team.name} ({team.pokemons.length}/6)
									</option>
								{/each}
							</select>
						{/if}
					</div>
				</div>
				
				<!-- Results Grid -->
				{#if loading && pokemons.length === 0}
					<div class="flex justify-center items-center h-48">
						<LoadingSpinner 
							size="lg" 
							text="Searching Pokédx..." 
							showText={true}
						/>
					</div>
				{:else if pokemons.length === 0}
					<div class="text-center py-12">
						<div class="max-w-sm mx-auto">
							<svg class="mx-auto h-12 w-12 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
							<h3 class="mt-3 text-sm font-medium theme-text">No Pokémon found</h3>
							<p class="mt-1 text-xs theme-text-secondary mb-4">
								Try adjusting your search criteria
							</p>
							<button
								on:click={handleClear}
								class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
							>
								Clear Search
							</button>
						</div>
					</div>
				{:else}
					<!-- Compact Grid -->
					<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{#each sortedPokemon as pokemon (pokemon.id)}
							<div class="group relative">
								<PokemonCard 
									{pokemon} 
									showStats={true}
									showAddToTeam={selectedTeam !== null}
									onClick={() => goto(`/pokemon/${pokemon.name}`)}
									compact={false}
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
							</div>
						{/each}
					</div>
					
					<!-- Load More -->
					{#if hasMore}
						<div class="text-center pt-6">
							{#if loadingMore}
								<div class="flex justify-center items-center py-4">
									<LoadingSpinner 
										size="sm" 
										text="Loading more..." 
										showText={true}
									/>
								</div>
							{:else}
								<button
									on:click={loadMore}
									class="px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
								>
									{#if searchQuery}
										Load More ({pokemons.length}/{totalResults})
									{:else}
										Load More ({pokemons.length} loaded)
									{/if}
								</button>
							{/if}
						</div>
					{:else if pokemons.length > 0}
						<div class="text-center py-4">
							<p class="text-xs theme-text-secondary">
								{#if searchQuery}
									Showing all {pokemons.length} results
								{:else}
									Showing all {pokemons.length} loaded Pokémon
								{/if}
							</p>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div> 