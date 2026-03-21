<script lang="ts">
	import type { SearchFilters, SearchEvent } from '$lib/types';
	import { POKEMON_TYPES, GENERATIONS, getTypeColor } from '$lib/utils/pokemon-utils';
	import { SearchFilterUtils } from '$lib/utils/search-filter-utils';
	import { Search, Filter, ChevronDown, X } from '$lib/icons';

	interface Props {
		searchQuery?: string;
		onsearch?: (event: SearchEvent) => void;
		onclear?: () => void;
	}

	let {
		searchQuery: initialQuery = '',
		onsearch,
		onclear
	}: Props = $props();

	// Local state — fully owned by this component.
	let searchQuery = $state('');
	let filters = $state<SearchFilters>(SearchFilterUtils.createEmptyFilters());

	// When the parent pushes a new query (e.g. URL init), reflect it in the input.
	$effect(() => {
		searchQuery = initialQuery;
	});

	let showFilters = $state(false);

	let debounceTimer: ReturnType<typeof setTimeout> | undefined;
	function debouncedSearch(delay = 300) {
		clearTimeout(debounceTimer);
		debounceTimer = setTimeout(handleSearch, delay);
	}

	const statRanges = SearchFilterUtils.STAT_RANGES;

	function handleSearch() {
		onsearch?.({ query: searchQuery, filters });
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Enter') {
			handleSearch();
		}
	}

	function toggleType(type: string) {
		filters = SearchFilterUtils.toggleType(filters, type);
		debouncedSearch();
	}

	function toggleGeneration(generation: number) {
		filters = SearchFilterUtils.toggleGeneration(filters, generation);
		debouncedSearch();
	}

	function updateStatFilter(statName: string, type: 'min' | 'max', value: number) {
		filters = SearchFilterUtils.updateStatFilter(filters, statName, type, value);
		debouncedSearch(600);
	}

	function clearFilters() {
		searchQuery = '';
		filters = SearchFilterUtils.createEmptyFilters();
		onclear?.();
	}
</script>

<div class="rounded-xl shadow-lg p-3 sm:p-4" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
	<!-- Row 1: Search input + Search button -->
	<div class="flex gap-2 mb-3">
		<div class="relative flex-1">
			<input
				type="text"
				placeholder="Search by name or #ID…"
				bind:value={searchQuery}
				onkeydown={handleKeydown}
				class="input input-bordered w-full pl-9 pr-3 py-2.5 rounded-lg text-sm"
				style="background-color: var(--bg-main); border-color: var(--border-color); color: var(--text-main);"
			/>
			<span class="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style="color: var(--text-muted);">
				<Search size={16} />
			</span>
		</div>
		<button onclick={handleSearch} class="btn-brand rounded-lg px-4 py-2.5 text-sm whitespace-nowrap">
			Search
		</button>
	</div>

	<!-- Row 2: Type pills (always visible, horizontally scrollable) -->
	<div class="relative mb-3">
		<div class="overflow-x-auto pb-1" style="scrollbar-width: none; -ms-overflow-style: none;">
			<div class="flex gap-1.5 min-w-max">
				{#each POKEMON_TYPES as type}
					<button
						onclick={() => toggleType(type)}
						class="px-3 py-1 rounded-full text-xs font-semibold text-white whitespace-nowrap transition-all"
						style="background-color: {getTypeColor(type)}; opacity: {filters.types.includes(type) ? '1' : '0.5'}; outline: {filters.types.includes(type) ? '2px solid white' : 'none'}; outline-offset: 1px; transform: {filters.types.includes(type) ? 'scale(1.08)' : 'scale(1)'};"
					>
						{type}
					</button>
				{/each}
			</div>
		</div>
		<div class="absolute right-0 top-0 w-6 h-full pointer-events-none"
			style="background: linear-gradient(to right, transparent, var(--bg-secondary));"></div>
	</div>

	<!-- Row 3: More filters toggle + clear -->
	<div class="flex items-center justify-between gap-2">
		<button
			onclick={() => (showFilters = !showFilters)}
			class="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
			style="background-color: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-color);"
		>
			<Filter size={16} />
			Gen &amp; Stats
			<span class="transition-transform {showFilters ? 'rotate-180' : ''}">
				<ChevronDown size={14} />
			</span>
		</button>

		{#if filters.types.length > 0 || filters.generations.length > 0}
			<button
				onclick={clearFilters}
				class="flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors"
				style="color: var(--brand-red); background-color: var(--brand-red-muted);"
			>
				<X size={14} />
				Clear filters
			</button>
		{/if}
	</div>

	<!-- Advanced Filters (Gen + Stats) collapsible -->
	{#if showFilters}
		<div class="mt-4 space-y-5 pt-4" style="border-top: 1px solid var(--border-color);">
			<!-- Generation Filters -->
			<div>
				<h3 class="text-sm font-semibold theme-text mb-2">Generation</h3>
				<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
					{#each GENERATIONS as generation}
						<button
							onclick={() => toggleGeneration(generation.id)}
							class="px-3 py-2 rounded-lg border-2 text-left transition-all"
							style="{filters.generations.includes(generation.id.toString())
								? `border-color: var(--brand-red); background-color: var(--brand-red-muted); color: var(--brand-red);`
								: `border-color: var(--border-color); color: var(--text-secondary);`}"
						>
							<div class="text-xs font-semibold">{generation.name}</div>
							<div class="text-xs opacity-70">{generation.range}</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Stat Filters -->
			<div>
				<h3 class="text-sm font-semibold theme-text mb-2">Base Stats</h3>
				<div class="grid grid-cols-1 gap-3">
					{#each Object.entries(statRanges) as [statName, range]}
						<div>
							<p class="text-xs font-medium mb-1.5" style="color: var(--text-secondary);">{SearchFilterUtils.formatStatName(statName)}</p>
							<div class="flex gap-3 items-start">
								<div class="flex-1">
									<label for="min-{statName}" class="block text-xs mb-1" style="color: var(--text-muted);">
										Min: {SearchFilterUtils.getStatValue(filters, statName, 'min')}
									</label>
									<input
										id="min-{statName}"
										type="range"
										min={range.min}
										max={range.max}
										value={SearchFilterUtils.getStatValue(filters, statName, 'min')}
										oninput={(e) => updateStatFilter(statName, 'min', parseInt((e.currentTarget as HTMLInputElement).value))}
										class="w-full accent-red-600"
									/>
								</div>
								<div class="flex-1">
									<label for="max-{statName}" class="block text-xs mb-1" style="color: var(--text-muted);">
										Max: {SearchFilterUtils.getStatValue(filters, statName, 'max')}
									</label>
									<input
										id="max-{statName}"
										type="range"
										min={range.min}
										max={range.max}
										value={SearchFilterUtils.getStatValue(filters, statName, 'max')}
										oninput={(e) => updateStatFilter(statName, 'max', parseInt((e.currentTarget as HTMLInputElement).value))}
										class="w-full accent-red-600"
									/>
								</div>
							</div>
						</div>
					{/each}
				</div>
			</div>
		</div>
	{/if}
</div>

