import { writable, derived } from 'svelte/store';
import type { Pokemon, SearchFilters } from '$lib/types';
import { SearchService } from '$lib/services/search-service';
import { SortUtils } from '$lib/utils/sort-utils';
import { URLUtils } from '$lib/utils/url-utils';

export type SortBy = 'id' | 'name' | 'stats';
export type SortOrder = 'asc' | 'desc';

interface SearchState {
	query: string;
	filters: SearchFilters;
	pokemons: Pokemon[];
	loading: boolean;
	loadingMore: boolean;
	hasMore: boolean;
	hasSearched: boolean;
	totalResults: number;
	offset: number;
	sortBy: SortBy;
	sortOrder: SortOrder;
}

const initialState: SearchState = {
	query: '',
	filters: { types: [], generations: [] },
	pokemons: [],
	loading: false,
	loadingMore: false,
	hasMore: false,
	hasSearched: false,
	totalResults: 0,
	offset: 0,
	sortBy: 'id',
	sortOrder: 'asc'
};

function createSearchStore() {
	const { subscribe, set, update } = writable<SearchState>(initialState);

	return {
		subscribe,

		// Initialize from URL params
		initializeFromUrl: (searchParams: URLSearchParams) => {
			update(state => ({
				...state,
				query: searchParams.get('q') || '',
				filters: {
					types: searchParams.get('types')?.split(',').filter(Boolean) || [],
					generations: searchParams.get('generations')?.split(',').filter(Boolean) || []
				},
				offset: parseInt(searchParams.get('offset') || '0')
			}));
		},

		// Perform search
		performSearch: async (query: string, filters: SearchFilters) => {
			update(state => ({
				...state,
				loading: true,
				query,
				filters,
				offset: 0,
				hasSearched: true
			}));

			const result = await SearchService.performSearch(query, filters, 20, 0);

			update(state => ({
				...state,
				loading: false,
				pokemons: result.pokemons,
				hasMore: result.hasMore,
				totalResults: result.totalResults
			}));

			// Update URL
			URLUtils.updateSearchUrl(query, filters, 0);
		},

		// Load more results
		loadMore: async () => {
			update(state => {
				if (state.loadingMore || !state.hasMore) return state;
				return { ...state, loadingMore: true, offset: state.offset + 20 };
			});

			const currentState = await new Promise<SearchState>(resolve => {
				const unsubscribe = subscribe(resolve);
				unsubscribe();
			});

			const result = await SearchService.loadMoreResults(
				currentState.pokemons,
				currentState.query,
				currentState.filters,
				20,
				currentState.offset
			);

			update(state => ({
				...state,
				loadingMore: false,
				pokemons: result.pokemons,
				hasMore: result.hasMore,
				totalResults: result.totalResults
			}));
		},

		// Clear search
		clearSearch: () => {
			set(initialState);
			URLUtils.updateSearchUrl('', { types: [], generations: [] }, 0);
		},

		// Update sorting
		updateSort: (sortBy: SortBy, sortOrder: SortOrder) => {
			update(state => ({
				...state,
				sortBy,
				sortOrder
			}));
		},

		// Toggle sort order
		toggleSortOrder: () => {
			update(state => ({
				...state,
				sortOrder: state.sortOrder === 'asc' ? 'desc' : 'asc'
			}));
		}
	};
}

export const searchStore = createSearchStore();

// Derived store for sorted pokemons
export const sortedPokemons = derived(
	searchStore,
	($searchStore) => SortUtils.sortPokemon($searchStore.pokemons, $searchStore.sortBy, $searchStore.sortOrder)
);