<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';
	import type { SearchFilters } from '$lib/types';
	import { POKEMON_TYPES, GENERATIONS, getTypeColor } from '$lib/utils/pokemon-utils';
	
	const dispatch = createEventDispatcher<{
		search: { query: string; filters: SearchFilters };
		clear: void;
	}>();
	
	export let searchQuery = '';
	export let filters: SearchFilters = {
		types: [],
		generations: [],
		minStats: {},
		maxStats: {}
	};
	
	let showFilters = false;
	let searchTimeout: ReturnType<typeof setTimeout>;
	
	// Stats ranges for sliders
	const statRanges = {
		hp: { min: 1, max: 255 },
		attack: { min: 1, max: 190 },
		defense: { min: 1, max: 230 },
		specialAttack: { min: 1, max: 194 },
		specialDefense: { min: 1, max: 230 },
		speed: { min: 1, max: 180 }
	};
	
	function handleSearchInput() {
		clearTimeout(searchTimeout);
		searchTimeout = setTimeout(() => {
			dispatch('search', { query: searchQuery, filters });
		}, 300);
	}
	
	function toggleType(type: string) {
		if (filters.types.includes(type)) {
			filters.types = filters.types.filter(t => t !== type);
		} else {
			filters.types = [...filters.types, type];
		}
		dispatch('search', { query: searchQuery, filters });
	}
	
	function toggleGeneration(generation: number) {
		const genString = generation.toString();
		if (filters.generations.includes(genString)) {
			filters.generations = filters.generations.filter(g => g !== genString);
		} else {
			filters.generations = [...filters.generations, genString];
		}
		dispatch('search', { query: searchQuery, filters });
	}
	
	function updateStatFilter(statName: string, type: 'min' | 'max', value: number) {
		if (type === 'min') {
			if (!filters.minStats) filters.minStats = {};
			filters.minStats[statName] = value;
		} else {
			if (!filters.maxStats) filters.maxStats = {};
			filters.maxStats[statName] = value;
		}
		dispatch('search', { query: searchQuery, filters });
	}
	
	function clearFilters() {
		searchQuery = '';
		filters = {
			types: [],
			generations: [],
			minStats: {},
			maxStats: {}
		};
		dispatch('clear');
	}
	
	function formatStatName(statName: string): string {
		const names: { [key: string]: string } = {
			hp: 'HP',
			attack: 'Attack',
			defense: 'Defense',
			specialAttack: 'Sp. Attack',
			specialDefense: 'Sp. Defense',
			speed: 'Speed'
		};
		return names[statName] || statName;
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4 border border-gray-200 dark:border-gray-700">
	<!-- Search Input -->
	<div class="relative mb-4">
		<input
			type="text"
			placeholder="Search Pokémon by name..."
			bind:value={searchQuery}
			on:input={handleSearchInput}
			class="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
		/>
		<svg
			class="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
		</svg>
	</div>
	
	<!-- Filter Toggle -->
	<div class="flex justify-between items-center mb-4">
		<button
			on:click={() => showFilters = !showFilters}
			class="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
		>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707v4.586a1 1 0 01-.293.707l-2 2A1 1 0 0111 21V12.414a1 1 0 00-.293-.707L4.293 7.293A1 1 0 014 6.586V4z"></path>
			</svg>
			Filters
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
			class="px-4 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors"
		>
			Clear All
		</button>
	</div>
	
	<!-- Advanced Filters -->
	{#if showFilters}
		<div class="space-y-6 pt-4 border-t border-gray-200 dark:border-gray-700">
			<!-- Type Filters -->
			<div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Types</h3>
				<div class="flex flex-wrap gap-2">
					{#each POKEMON_TYPES as type}
						<button
							on:click={() => toggleType(type)}
							class="px-3 py-2 rounded-full text-sm font-semibold text-white transition-all transform hover:scale-105 {filters.types.includes(type) ? 'ring-2 ring-offset-2 ring-blue-400 scale-105' : 'opacity-70'}"
							style="background-color: {getTypeColor(type)}"
						>
							{type}
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Generation Filters -->
			<div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Generations</h3>
				<div class="flex flex-wrap gap-2">
					{#each GENERATIONS as generation}
						<button
							on:click={() => toggleGeneration(generation.id)}
							class="px-4 py-2 rounded-lg border-2 transition-all {filters.generations.includes(generation.id.toString()) 
								? 'border-blue-500 bg-blue-500 text-white' 
								: 'border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-blue-300'}"
						>
							<div class="text-sm">
								<div class="font-semibold">{generation.name}</div>
								<div class="text-xs opacity-80">{generation.range}</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
			
			<!-- Stat Filters -->
			<div>
				<h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-3">Base Stats</h3>
				<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
					{#each Object.entries(statRanges) as [statName, range]}
						<div class="space-y-2">
							<div class="block text-sm font-medium text-gray-700 dark:text-gray-300">
								{formatStatName(statName)}
							</div>
							<div class="flex gap-2 items-center">
								<div class="flex-1">
									<label for="min-{statName}" class="block text-xs text-gray-500">Min</label>
									<input
										id="min-{statName}"
										type="range"
										min={range.min}
										max={range.max}
										value={filters.minStats?.[statName] || range.min}
										on:input={(e) => updateStatFilter(statName, 'min', parseInt(e.currentTarget.value))}
										class="w-full"
									/>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{filters.minStats?.[statName] || range.min}
									</span>
								</div>
								<div class="flex-1">
									<label for="max-{statName}" class="block text-xs text-gray-500">Max</label>
									<input
										id="max-{statName}"
										type="range"
										min={range.min}
										max={range.max}
										value={filters.maxStats?.[statName] || range.max}
										on:input={(e) => updateStatFilter(statName, 'max', parseInt(e.currentTarget.value))}
										class="w-full"
									/>
									<span class="text-xs text-gray-600 dark:text-gray-400">
										{filters.maxStats?.[statName] || range.max}
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
