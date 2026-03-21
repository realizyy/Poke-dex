import type { Pokemon, SearchFilters } from '$lib/types';
import { SearchService } from '$lib/services/search-service';
import { toastStore } from './toast-store.svelte';
import { URLUtils } from '$lib/utils/url-utils';

export type SortBy = 'id' | 'name' | 'stats';
export type SortOrder = 'asc' | 'desc';

class SearchStore {
	query: string = $state('');
	filters: SearchFilters = $state({ types: [], generations: [] });
	pokemons: Pokemon[] = $state([]);
	loading: boolean = $state(false);
	loadingMore: boolean = $state(false);
	hasMore: boolean = $state(false);
	hasSearched: boolean = $state(false);
	totalResults: number = $state(0);
	offset: number = $state(0);
	sortBy: SortBy = $state('id');
	sortOrder: SortOrder = $state('asc');

	sortedPokemons: Pokemon[] = $derived(
		[...this.pokemons].sort((a, b) => {
			const mult = this.sortOrder === 'asc' ? 1 : -1;
			const av = a[this.sortBy as keyof Pokemon];
			const bv = b[this.sortBy as keyof Pokemon];
			return (av > bv ? 1 : av < bv ? -1 : 0) * mult;
		})
	);

	initializeFromUrl(searchParams: URLSearchParams) {
		this.query = searchParams.get('q') ?? '';
		this.filters = {
			types: searchParams.get('types')?.split(',').filter(Boolean) ?? [],
			generations: searchParams.get('generations')?.split(',').filter(Boolean) ?? []
		};
		this.offset = parseInt(searchParams.get('offset') ?? '0');
	}

	async performSearch(query: string, filters: SearchFilters) {
		const hasActiveFilters = filters.types.length > 0 || filters.generations.length > 0;
		if (!query.trim() && !hasActiveFilters) {
			this.query = '';
			this.filters = filters;
			this.hasSearched = false;
			this.pokemons = [];
			this.loading = false;
			this.hasMore = false;
			this.totalResults = 0;
			this.offset = 0;
			return;
		}

		this.loading = true;
		this.query = query;
		this.filters = filters;
		this.offset = 0;
		this.hasSearched = true;

		try {
			const result = await SearchService.performSearch(query, filters, 20, 0);
			this.loading = false;
			this.pokemons = result.pokemons;
			this.hasMore = result.hasMore;
			this.totalResults = result.totalResults;

			if (result.pokemons.length === 0) {
				toastStore.warning('No Results', 'No Pokémon found matching your search criteria');
			} else if (query.trim()) {
				toastStore.success('Search Complete', `Found ${result.totalResults} Pokémon matching "${query}"`);
			} else {
				toastStore.info('Filter Applied', `Found ${result.totalResults} Pokémon matching your filters`);
			}

			URLUtils.updateSearchUrl(query, filters, 0);
		} catch {
			this.loading = false;
			this.pokemons = [];
			this.hasMore = false;
			this.totalResults = 0;
			toastStore.error('Search Error', 'Failed to perform search. Please try again.');
		}
	}

	async loadMore() {
		if (this.loadingMore || !this.hasMore) return;
		this.loadingMore = true;
		this.offset += 20;

		const result = await SearchService.loadMoreResults(
			this.pokemons,
			this.query,
			this.filters,
			20,
			this.offset
		);

		this.loadingMore = false;
		this.pokemons = result.pokemons;
		this.hasMore = result.hasMore;
		this.totalResults = result.totalResults;
	}

	clearSearch() {
		this.query = '';
		this.filters = { types: [], generations: [] };
		this.pokemons = [];
		this.loading = false;
		this.loadingMore = false;
		this.hasMore = false;
		this.hasSearched = false;
		this.totalResults = 0;
		this.offset = 0;
		URLUtils.updateSearchUrl('', { types: [], generations: [] }, 0);
	}

	updateSort(sortBy: SortBy, sortOrder: SortOrder) {
		this.sortBy = sortBy;
		this.sortOrder = sortOrder;
	}

	toggleSortOrder() {
		this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
	}

	/** Returns true when the store already holds results for this exact query+filters combo.
	 *  Used on back-navigation to skip an unnecessary re-fetch. */
	isCurrentSearch(query: string, filters: SearchFilters): boolean {
		if (!this.hasSearched || this.loading) return false;
		if (this.query !== query) return false;
		const sameTypes = [...(this.filters.types ?? [])].sort().join(',') ===
			[...(filters.types ?? [])].sort().join(',');
		const sameGens  = [...(this.filters.generations ?? [])].sort().join(',') ===
			[...(filters.generations ?? [])].sort().join(',');
		return sameTypes && sameGens;
	}
}

export const searchStore = new SearchStore();
