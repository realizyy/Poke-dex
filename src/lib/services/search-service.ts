import type { Pokemon, SearchFilters } from '$lib/types';
import { PokemonService } from './pokemon-service';

export interface SearchResult {
	pokemons: Pokemon[];
	hasMore: boolean;
	totalResults: number;
}

export class SearchService {
	/**
	 * Perform search with query and filters
	 */
	static async performSearch(
		query: string,
		filters: SearchFilters,
		limit: number = 20,
		offset: number = 0
	): Promise<SearchResult> {
		try {
			if (query.trim()) {
				const searchResults = await PokemonService.searchPokemon(query, limit + offset);
				return {
					pokemons: offset > 0 ? searchResults.slice(offset) : searchResults,
					hasMore: searchResults.length > limit + offset,
					totalResults: searchResults.length
				};
			} else {
				const filterResult = await PokemonService.fetchPokemonWithFilters(filters, limit, offset);
				return {
					pokemons: filterResult.pokemons,
					hasMore: filterResult.hasMore,
					totalResults: filterResult.pokemons.length
				};
			}
		} catch (error) {
			console.error('Search service error:', error);
			return {
				pokemons: [],
				hasMore: false,
				totalResults: 0
			};
		}
	}

	/**
	 * Load more results for existing search
	 */
	static async loadMoreResults(
		currentPokemons: Pokemon[],
		query: string,
		filters: SearchFilters,
		limit: number = 20,
		offset: number = 0
	): Promise<SearchResult> {
		try {
			if (query.trim()) {
				const searchResults = await PokemonService.searchPokemon(query, limit + offset);
				const newPokemons = searchResults.slice(offset);
				return {
					pokemons: [...currentPokemons, ...newPokemons],
					hasMore: searchResults.length > offset + limit,
					totalResults: searchResults.length
				};
			} else {
				const filterResult = await PokemonService.fetchPokemonWithFilters(filters, limit, offset);
				return {
					pokemons: [...currentPokemons, ...filterResult.pokemons],
					hasMore: filterResult.hasMore,
					totalResults: currentPokemons.length + filterResult.pokemons.length
				};
			}
		} catch (error) {
			console.error('Load more service error:', error);
			return {
				pokemons: currentPokemons,
				hasMore: false,
				totalResults: currentPokemons.length
			};
		}
	}
}