<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { preloadData } from '$app/navigation';
	import type { SearchEvent } from '$lib/types';

	// Components
	import SearchFilter from '../../components/search/SearchFilter.svelte';
	import PokemonCard from '../../components/ui/PokemonCard.svelte';
	import LoadingSpinner from '../../components/ui/LoadingSpinner.svelte';
	import { SearchX, ArrowUp } from '$lib/icons';

	// Stores (Svelte 5 class-based)
	import { searchStore } from '$lib/stores/search.svelte';
	import { teamStore } from '$lib/stores/team.svelte';
	import { URLUtils } from '$lib';

	// Initialise once on mount — picks up URL params that the server already resolved.
	onMount(() => {
		teamStore.loadTeams();

		const urlQuery   = $page.url.searchParams.get('q') ?? '';
		const urlTypes   = $page.url.searchParams.get('types')?.split(',').filter(Boolean) ?? [];
		const urlGens    = $page.url.searchParams.get('generations')?.split(',').filter(Boolean) ?? [];

		if (urlQuery || urlTypes.length > 0 || urlGens.length > 0) {
			const filtersFromUrl = { types: urlTypes, generations: urlGens };
			if (!searchStore.isCurrentSearch(urlQuery, filtersFromUrl)) {
				searchStore.performSearch(urlQuery, filtersFromUrl);
			}
		}

		// Restore scroll position after back-navigating from a detail page.
		const savedScroll = sessionStorage.getItem('search-scroll');
		if (savedScroll && searchStore.hasSearched) {
			const y = parseInt(savedScroll);
			sessionStorage.removeItem('search-scroll');
			requestAnimationFrame(() => window.scrollTo({ top: y, behavior: 'instant' }));
		}

		});

	// Svelte action — runs when the sentinel element is actually inserted into the DOM.
	function infiniteScroll(node: HTMLElement) {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting && searchStore.hasMore && !searchStore.loadingMore) {
					searchStore.loadMore();
				}
			},
			{ rootMargin: '200px' }
		);
		observer.observe(node);
		return { destroy() { observer.disconnect(); } };
	}

	function handleSearch(event: SearchEvent) {
		searchStore.performSearch(event.query, event.filters);
	}

	function handleClear() {
		searchStore.clearSearch();
	}

	function handleSortChange(event: Event) {
		const target = event.target as HTMLSelectElement;
		searchStore.updateSort(target.value as any, searchStore.sortOrder);
	}

	function handleSortOrderToggle() {
		searchStore.toggleSortOrder();
	}

	function navigateToPokemon(pokemonName: string) {
		sessionStorage.setItem('search-scroll', window.scrollY.toString());
		URLUtils.navigateToPokemon(pokemonName);
	}

	function handleQuickSearch(query: string) {
		searchStore.performSearch(query, { types: [], generations: [] });
	}

	const quickPicks = [
		{ name: 'Pikachu', color: '#EFB44B' },
		{ name: 'Charizard', color: '#FA501A' },
		{ name: 'Bulbasaur', color: '#62BB5C' },
		{ name: 'Mewtwo', color: '#9B6DCA' },
		{ name: 'Gengar', color: '#6A5DAA' }
	];
</script>

<svelte:head>
	<title>Search Pokémon - Pokédx</title>
	<meta name="description" content="Search and filter through all Pokémon with advanced filters including type, generation, and stats." />
</svelte:head>

<div class="min-h-screen theme-bg" style="background-color: var(--bg-main);">
	<!-- Search Header -->
	<div class="theme-bg theme-border-b relative z-10" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
		<div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-3 sm:py-4">
			<SearchFilter 
				searchQuery={searchStore.query}
				onsearch={handleSearch}
				onclear={handleClear}
			/>
		</div>
	</div>

	<!-- Main Content -->
	<div class="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-6">
		{#if !searchStore.hasSearched}
			<!-- Welcome State: Pokeball illustration -->
			<div class="text-center py-12 sm:py-20 poke-scale-in">
				<!-- CSS Pokeball -->
				<div class="mx-auto mb-8 relative" style="width: 96px; height: 96px;">
					<div style="
						width: 96px; height: 96px;
						border-radius: 50%;
						background:
							radial-gradient(circle at center, #fff 0%,#fff 18%,transparent 18%),
							radial-gradient(circle at center, #374151 0%,#374151 22%,transparent 22%),
							linear-gradient(#374151 0%,#374151 100%) center/100% 4px no-repeat,
							linear-gradient(to bottom, var(--brand-red) 50%, #f9fafb 50%);
						border: 3px solid #374151;
						box-shadow: var(--shadow-hover);
						animation: float 3s ease-in-out infinite;
					"></div>
				</div>
				<h2 class="text-2xl font-bold theme-text mb-2">Find your Pokémon</h2>
				<p class="theme-text-secondary text-sm max-w-xs mx-auto mb-8">
					Search by name, filter by type, generation, or base stats.
				</p>
				<div class="flex flex-wrap justify-center gap-2">

					{#each quickPicks as pick}
						<button
							onclick={() => handleQuickSearch(pick.name.toLowerCase())}
							class="px-4 py-2 rounded-full text-white text-sm font-semibold transition-all hover:scale-105"
							style="background-color: {pick.color}; box-shadow: 0 4px 12px {pick.color}55;"
						>
							{pick.name}
						</button>
					{/each}
				</div>
			</div>
		{:else}
			<!-- Search Results -->
			<div class="space-y-4 sm:space-y-6">
				<!-- Results Header -->
				<div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
					<div class="flex items-center gap-2 sm:gap-3">
						<div class="flex items-center gap-1.5 sm:gap-2">
							<SearchX size={18} />
							<h2 class="text-base sm:text-lg font-semibold theme-text">Search Results</h2>
						</div>
						{#if searchStore.pokemons.length > 0}
							<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold"
								style="background-color: var(--brand-red-muted); color: var(--brand-red);">
								{searchStore.pokemons.length}
								{#if searchStore.totalResults > searchStore.pokemons.length}
									/ {searchStore.totalResults}
								{/if}
								found
							</span>
						{/if}
						{#if searchStore.loading}
							<LoadingSpinner size="sm" text="" showText={false} />
						{/if}
					</div>

					<!-- Sort Controls -->
					<div class="flex items-center gap-1.5 sm:gap-2">
						<select
							value={searchStore.sortBy}
							onchange={handleSortChange}
							class="select select-bordered select-sm"
							style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
						>
							<option value="id">#</option>
							<option value="name">Name</option>
							<option value="stats">Stats</option>
						</select>
						<button
							onclick={handleSortOrderToggle}
							class="btn btn-sm btn-ghost"
							title="Toggle sort order"
							aria-label="Toggle sort order"
						>
							<ArrowUp
								size={14}
								class="transition-transform duration-200 {searchStore.sortOrder === 'desc' ? 'rotate-180' : ''}"
							/>
						</button>
					</div>
				</div>

				<!-- Results Grid -->
				{#if searchStore.loading && searchStore.pokemons.length === 0}
					<div class="flex justify-center items-center h-32 sm:h-48">
						<LoadingSpinner size="lg" text="Searching Pokémon..." showText={true} />
					</div>
				{:else if searchStore.pokemons.length === 0}
					<div class="text-center py-8 sm:py-12">
						<div class="max-w-sm mx-auto">
							<SearchX size={48} class="mx-auto theme-text-secondary mb-3" />
							<h3 class="mt-3 text-sm font-medium theme-text">No Pokémon found</h3>
							<p class="mt-1 text-xs theme-text-secondary mb-4">Try adjusting your search criteria</p>
							<button onclick={handleClear} class="btn btn-primary btn-sm">Clear Search</button>
						</div>
					</div>
				{:else}
					<!-- Responsive results grid -->
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
					{#each searchStore.sortedPokemons as pokemon (pokemon.id)}
						<div role="none" onpointerenter={() => preloadData(`/pokemon/${pokemon.name}`)}>
							<PokemonCard
								{pokemon}
								showStats={true}
								compact={false}
								onClick={() => navigateToPokemon(pokemon.name)}
							/>
						</div>
					{/each}
				</div>

				<!-- Infinite scroll sentinel + skeleton loader -->
				{#if searchStore.hasMore || searchStore.loadingMore}
					<!-- Progress bar -->
					{#if searchStore.totalResults > 0}
						<div class="max-w-sm mx-auto pt-6 pb-2">
							<div class="flex justify-between text-xs theme-text-secondary mb-1.5">
								<span>{searchStore.pokemons.length} loaded</span>
								<span>{searchStore.totalResults} total</span>
							</div>
							<div class="w-full h-1 rounded-full overflow-hidden" style="background-color: var(--bg-tertiary);">
								<div
									class="h-full rounded-full transition-all duration-500"
									style="width: {Math.round(searchStore.pokemons.length / searchStore.totalResults * 100)}%; background-color: var(--brand-red);"
								></div>
							</div>
						</div>
					{/if}

					<!-- Skeleton cards shown while loading more -->
					{#if searchStore.loadingMore}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-5">
							{#each { length: 4 } as _}
								<div class="rounded-2xl overflow-hidden animate-pulse" style="background-color: var(--bg-secondary);">
									<div class="h-36 w-full" style="background-color: var(--bg-tertiary);"></div>
									<div class="p-4 space-y-3">
										<div class="h-4 w-2/3 rounded-full" style="background-color: var(--bg-tertiary);"></div>
										<div class="h-3 w-1/3 rounded-full" style="background-color: var(--bg-tertiary);"></div>
										<div class="space-y-2 pt-1">
											{#each { length: 3 } as __}
												<div class="h-2 w-full rounded-full" style="background-color: var(--bg-tertiary);"></div>
											{/each}
										</div>
									</div>
								</div>
							{/each}
						</div>
					{/if}

					<!-- Loading indicator — always visible so the user knows more are coming -->
					<div class="flex flex-col items-center gap-3 py-6">
						<!-- Animated bouncing dots -->
						<div class="flex items-center gap-1.5">
							{#each [0, 1, 2] as i}
								<div
									class="w-2.5 h-2.5 rounded-full animate-bounce"
									style="background-color: var(--brand-red); animation-delay: {i * 0.15}s;"
								></div>
							{/each}
						</div>
						<p class="text-xs theme-text-secondary">
							{searchStore.loadingMore ? 'Loading more Pokémon...' : 'Scroll down to load more'}
						</p>
					</div>

					<!-- Invisible sentinel — mounted/destroyed with the conditional block -->
					<div use:infiniteScroll class="h-2"></div>
				{:else if searchStore.pokemons.length > 0}
					<div class="text-center py-4">
						<p class="text-xs theme-text-secondary">
							All {searchStore.pokemons.length} Pokémon loaded
						</p>
					</div>
				{/if}
			{/if}
			</div>
		{/if}
	</div>
</div>

