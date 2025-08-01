<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { SearchFilters, SearchEvent } from '$lib/types';
	import { POKEMON_TYPES, GENERATIONS, getTypeColor } from '$lib/utils/pokemon-utils';
	import { SearchFilterUtils } from '$lib/utils/search-filter-utils';
	
	const dispatch = createEventDispatcher<{
		search: SearchEvent;
		clear: void;
	}>();
	
	export let searchQuery = '';
	export let filters: SearchFilters = SearchFilterUtils.createEmptyFilters();
	
	let showFilters = false;
	
	// Get stat ranges from utils
	const statRanges = SearchFilterUtils.STAT_RANGES;
	
	function handleSearch() {
		dispatch('search', { query: searchQuery, filters });
	}
	
	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}
	
	function toggleType(type: string) {
		filters = SearchFilterUtils.toggleType(filters, type);
		handleSearch();
	}
	
	function toggleGeneration(generation: number) {
		filters = SearchFilterUtils.toggleGeneration(filters, generation);
		handleSearch();
	}
	
	function updateStatFilter(statName: string, type: 'min' | 'max', value: number) {
		filters = SearchFilterUtils.updateStatFilter(filters, statName, type, value);
		handleSearch();
	}
	
	function clearFilters() {
		searchQuery = '';
		filters = SearchFilterUtils.createEmptyFilters();
		dispatch('clear');
	}
</script>

<div class="theme-bg-secondary rounded-xl shadow-lg p-3 sm:p-4 theme-border border-1" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
	<!-- Search Input - Mobile Responsive -->
	<div class="mb-3 sm:mb-4">
		<!-- Search Input Row -->
		<div class="flex flex-col sm:flex-row gap-2 sm:gap-3">
			<div class="relative flex-1">
				<input
					type="text"
					placeholder="Search Pokémon by name..."
					bind:value={searchQuery}
					on:keydown={handleKeydown}
					class="w-full pl-10 pr-4 py-2.5 sm:py-3 rounded-lg theme-border theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
					style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
				/>
				<svg
					class="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 theme-text-muted"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
				>
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
			</div>
			<button
				on:click={handleSearch}
				class="px-4 sm:px-6 py-2.5 sm:py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
				<span class="hidden sm:inline">Search</span>
				<span class="sm:hidden">Search</span>
			</button>
		</div>
	</div>
	
	<!-- Filter Controls - Mobile Responsive -->
	<div class="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
		<button
			on:click={() => showFilters = !showFilters}
			class="flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors text-sm sm:text-base"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0111 21V12.414a1 1 0 00-.293-.707L4.293 7.293A1 1 0 014 6.586V4z"></path>
			</svg>
			<span class="hidden sm:inline">Filters</span>
			<span class="sm:hidden">Filters</span>
			<svg 
				class="w-4 h-4 transition-transform {showFilters ? 'rotate-180' : ''}"
				fill="none" 
				stroke="currentColor" 
				viewBox="0 0 24 24"
			>
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
			</svg>
		</button>
		
		<button
			on:click={clearFilters}
			class="px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors text-sm sm:text-base"
		>
			Clear All
		</button>
	</div>
	
	<!-- Advanced Filters -->
	{#if showFilters}
		<div class="space-y-4 sm:space-y-6 pt-3 sm:pt-4 theme-border" style="border-top: 1px solid var(--border-color);">
			<!-- Type Filters -->
			<div>
				<h3 class="text-base sm:text-lg font-semibold theme-text mb-2 sm:mb-3">Types</h3>
				<div class="flex flex-wrap gap-1.5 sm:gap-2">
					{#each POKEMON_TYPES as type}
						<button
							on:click={() => toggleType(type)}
							class="px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-semibold text-white transition-all transform hover:scale-105 {filters.types.includes(type) ? 'ring-2 ring-offset-2 ring-blue-400 scale-105' : 'opacity-70'}"
							style="background-color: {getTypeColor(type)}"
						>
							{type}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Generation Filters -->
			<div>
				<h3 class="text-base sm:text-lg font-semibold theme-text mb-2 sm:mb-3">Generations</h3>
				<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
					{#each GENERATIONS as generation}
						<button
							on:click={() => toggleGeneration(generation.id)}
							class="px-3 sm:px-4 py-2 rounded-lg border-2 transition-all {filters.generations.includes(generation.id.toString()) 
								? 'border-blue-500 bg-blue-500 text-white' 
								: 'theme-border theme-text-secondary hover:border-blue-300'}"
							style="{!filters.generations.includes(generation.id.toString()) 
								? `border-color: var(--border-color); color: var(--text-secondary);` 
								: ''}"
						>
							<div class="text-xs sm:text-sm">
								<div class="font-semibold">{generation.name}</div>
								<div class="text-xs opacity-80">{generation.range}</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Stat Filters -->
			<div>
				<h3 class="text-base sm:text-lg font-semibold theme-text mb-2 sm:mb-3">Base Stats</h3>
				<div class="grid grid-cols-1 gap-3 sm:gap-4">
					{#each Object.entries(statRanges) as [statName, range]}
						<div class="space-y-2">
							<div class="block text-sm font-medium theme-text-secondary">
								{SearchFilterUtils.formatStatName(statName)}
							</div>
							<div class="flex gap-2 items-center">
								<div class="flex-1">
									<label for="min-{statName}" class="block text-xs theme-text-muted">Min</label>
									<input
										id="min-{statName}"
										type="range"
										min={range.min}
										max={range.max}
										value={SearchFilterUtils.getStatValue(filters, statName, 'min')}
										on:input={(e) => updateStatFilter(statName, 'min', parseInt(e.currentTarget.value))}
										class="w-full"
									/>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{SearchFilterUtils.getStatValue(filters, statName, 'min')}
									</span>
								</div>
								<div class="flex-1">
									<label for="max-{statName}" class="block text-xs text-gray-500">Max</label>
									<input
										id="max-{statName}"
										type="range"
										min={range.min}
										max={range.max}
										value={SearchFilterUtils.getStatValue(filters, statName, 'max')}
										on:input={(e) => updateStatFilter(statName, 'max', parseInt(e.currentTarget.value))}
										class="w-full"
									/>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{SearchFilterUtils.getStatValue(filters, statName, 'max')}
									</span>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>
