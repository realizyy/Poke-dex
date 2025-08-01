<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { PageData } from './$types';
	import type { SearchEvent, TeamSelectedEvent } from '$lib/types';
	
	// Components
	import SearchFilter from '../../components/search/SearchFilter.svelte';
	import PokemonCard from '../../components/ui/PokemonCard.svelte';
	import LoadingSpinner from '../../components/ui/LoadingSpinner.svelte';
	import AddToTeamModal from '../../components/ui/AddToTeamModal.svelte';
	
	// Stores and Services
	import { searchStore, sortedPokemons } from '$lib/stores/search';
	import { modalStore } from '$lib/stores/modal';
	import { teamStore } from '$lib/stores/team';
	import { URLUtils, SortUtils } from '$lib';
	
	export let data: PageData;
	
	// Reactive store subscriptions
	$: searchState = $searchStore;
	$: modalState = $modalStore;
	
	onMount(() => {
		// Initialize stores
		teamStore.loadTeams();
		
		// Only initialize search from URL params if there's an explicit query or filters
		if (data.query || (data.filters && (data.filters.types.length > 0 || data.filters.generations.length > 0))) {
			searchStore.performSearch(
				data.query || '',
				data.filters || { types: [], generations: [] }
			);
		}
	});
	
	// Event handlers
	function handleSearch(event: CustomEvent<SearchEvent>) {
		searchStore.performSearch(event.detail.query, event.detail.filters);
	}
	
	function handleClear() {
		searchStore.clearSearch();
	}
	
	function handleLoadMore() {
		searchStore.loadMore();
	}
	
	function handleSortChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		searchStore.updateSort(target.value as any, searchState.sortOrder);
	}
	
	function handleSortOrderToggle() {
		searchStore.toggleSortOrder();
	}
	
	function openAddToTeamModal(pokemon: any) {
		modalStore.openAddToTeamModal(pokemon);
	}
	
	function handleTeamSelected(event: CustomEvent<TeamSelectedEvent>) {
		console.log(`Pokémon ${event.detail.pokemon.name} berhasil ditambahkan ke tim!`);
		// TODO: Add toast notification here
	}
	
	function navigateToPokemon(pokemonName: string) {
		URLUtils.navigateToPokemon(pokemonName);
	}
	
	// Quick search handlers for example buttons
	function handleQuickSearch(query: string) {
		searchStore.performSearch(query, { types: [], generations: [] });
	}
</script>

<svelte:head>
	<title>Search Pokémon - Pokédx</title>
	<meta name="description" content="Search and filter through all Pokémon with advanced filters including type, generation, and stats." />
</svelte:head>

<div class="min-h-screen theme-bg" style="background-color: var(--bg-main);">
	<!-- Search Header - Fixed positioning and z-index -->
	<div class="theme-bg theme-border-b relative z-10" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
		<div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
			<SearchFilter 
				bind:searchQuery={searchState.query}
				bind:filters={searchState.filters}
				on:search={handleSearch}
				on:clear={handleClear}
			/>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
		{#if !searchState.hasSearched}
			<!-- Welcome State -->
			<div class="text-center py-8 sm:py-12">
				<div class="max-w-md mx-auto">
					<div class="mb-4 sm:mb-6">
						<svg class="mx-auto h-12 w-12 sm:h-16 sm:w-16 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
					<h2 class="text-xl sm:text-2xl font-bold theme-text mb-2">Search Pokémon</h2>
					<p class="text-xs sm:text-sm theme-text-secondary mb-4 sm:mb-6 px-4">
						Enter a Pokémon name or use filters to find your favorite Pokémon
					</p>
					<div class="flex flex-wrap justify-center gap-2 px-4">
						<button 
							on:click={() => handleQuickSearch('pikachu')}
							class="px-3 sm:px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
						>
							Try "Pikachu"
						</button>
						<button 
							on:click={() => handleQuickSearch('charizard')}
							class="px-3 sm:px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
						>
							Try "Charizard"
						</button>
						<button 
							on:click={() => handleQuickSearch('bulbasaur')}
							class="px-3 sm:px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
						>
							Try "Bulbasaur"
						</button>
					</div>
				</div>
			</div>
		{:else}
			<!-- Search Results -->
			<div class="space-y-4 sm:space-y-6">
				<!-- Results Header -->
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
					<div class="flex items-center gap-2 sm:gap-3">
						<div class="flex items-center gap-1.5 sm:gap-2">
							<svg class="w-4 h-4 sm:w-5 sm:h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
							<h2 class="text-base sm:text-lg font-semibold theme-text">Search Results</h2>
						</div>
						
						{#if searchState.pokemons.length > 0}
							<span class="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
								{searchState.pokemons.length} found
							</span>
						{/if}
						
						{#if searchState.loading}
							<LoadingSpinner size="sm" text="" showText={false} />
						{/if}
					</div>
					
					<!-- Compact Controls -->
					<div class="flex items-center gap-2 sm:gap-3">
						<!-- Sort Controls -->
						<div class="flex items-center gap-1.5 sm:gap-2">
							<select 
								value={searchState.sortBy}
								on:change={handleSortChange}
								class="px-2 sm:px-3 py-1 sm:py-1.5 rounded-md theme-border theme-bg-secondary theme-text text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
								style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
							>
								<option value="id">#</option>
								<option value="name">Name</option>
								<option value="stats">Stats</option>
							</select>
							<button
								on:click={handleSortOrderToggle}
								class="p-1 sm:p-1.5 rounded-md theme-border theme-bg-secondary hover:theme-bg-tertiary transition-colors"
								style="background-color: var(--bg-secondary); border-color: var(--border-color);"
								title="Toggle sort order"
								aria-label="Toggle sort order"
							>
								<svg 
									class="w-3 h-3 theme-text-secondary transition-transform duration-200 {SortUtils.getSortOrderIconClass(searchState.sortOrder)}" 
									fill="none" 
									stroke="currentColor" 
									viewBox="0 0 24 24"
								>
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 11l5-5m0 0l5 5m-5-5v12"></path>
								</svg>
							</button>
						</div>
						

					</div>
				</div>
				
				<!-- Results Grid -->
				{#if searchState.loading && searchState.pokemons.length === 0}
					<div class="flex justify-center items-center h-32 sm:h-48">
						<LoadingSpinner 
							size="lg" 
							text="Searching Pokémon..." 
							showText={true}
						/>
					</div>
				{:else if searchState.pokemons.length === 0}
					<div class="text-center py-8 sm:py-12">
						<div class="max-w-sm mx-auto">
							<svg class="mx-auto h-10 w-10 sm:h-12 sm:w-12 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
							</svg>
							<h3 class="mt-3 text-sm font-medium theme-text">No Pokémon found</h3>
							<p class="mt-1 text-xs theme-text-secondary mb-4">
								Try adjusting your search criteria
							</p>
							<button
								on:click={handleClear}
								class="px-3 sm:px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
							>
								Clear Search
							</button>
						</div>
					</div>
				{:else}
					<!-- Mobile Responsive Grid -->
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 lg:gap-6">
						{#each $sortedPokemons as pokemon (pokemon.id)}
							<div class="group relative">
								<PokemonCard 
									{pokemon} 
									showStats={true}
									showAddToTeam={true}
									onClick={() => navigateToPokemon(pokemon.name)}
									compact={false}
								>
									<div slot="add-to-team">
										<button
											on:click|stopPropagation={() => openAddToTeamModal(pokemon)}
											class="w-full px-2 sm:px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors flex items-center justify-center gap-1.5 sm:gap-2"
										>
											<svg class="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
											</svg>
											<span class="hidden sm:inline">Add to Team</span>
											<span class="sm:hidden">Add</span>
										</button>
									</div>
								</PokemonCard>
							</div>
						{/each}
					</div>
					
					<!-- Load More -->
					{#if searchState.hasMore}
						<div class="text-center pt-4 sm:pt-6">
							{#if searchState.loadingMore}
								<div class="flex justify-center items-center py-3 sm:py-4">
									<LoadingSpinner 
										size="sm" 
										text="Loading more..." 
										showText={true}
									/>
								</div>
							{:else}
								<button
									on:click={handleLoadMore}
									class="px-4 sm:px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-xs sm:text-sm font-medium transition-colors"
								>
									{#if searchState.query}
										Load More ({searchState.pokemons.length}/{searchState.totalResults})
									{:else}
										Load More ({searchState.pokemons.length} loaded)
									{/if}
								</button>
							{/if}
						</div>
					{:else if searchState.pokemons.length > 0}
						<div class="text-center py-3 sm:py-4">
							<p class="text-xs theme-text-secondary">
								{#if searchState.query}
									Showing all {searchState.pokemons.length} results
								{:else}
									Menampilkan semua {searchState.pokemons.length} Pokémon yang dimuat
								{/if}
							</p>
						</div>
					{/if}
				{/if}
			</div>
		{/if}
	</div>
</div>

<!-- Add to Team Modal -->
{#if modalState.addToTeam.pokemon}
	<AddToTeamModal
		pokemon={modalState.addToTeam.pokemon}
		teams={$teamStore}
		bind:show={modalState.addToTeam.show}
		on:close={() => modalStore.closeAddToTeamModal()}
		on:teamSelected={handleTeamSelected}
	/>
{/if} 