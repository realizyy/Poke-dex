import type { Pokemon, SearchFilters } from '$lib/types';
import { PokemonService } from './pokemon-service';

export interface SearchResult {
	pokemons: Pokemon[];
	hasMore: boolean;
	totalResults: number;
}

// Returns the generation number for a given Pokémon ID
function genFromId(id: number): number {
	if (id <= 151) return 1;
	if (id <= 251) return 2;
	if (id <= 386) return 3;
	if (id <= 493) return 4;
	if (id <= 649) return 5;
	if (id <= 721) return 6;
	if (id <= 809) return 7;
	if (id <= 905) return 8;
	return 9;
}

// Apply type/generation filters on an already-fetched array (used after name search)
function applyClientFilters(pokemons: Pokemon[], filters: SearchFilters): Pokemon[] {
	const hasType = filters.types.length > 0;
	const hasGen  = filters.generations && filters.generations.length > 0;
	if (!hasType && !hasGen) return pokemons;
	return pokemons.filter(p => {
		if (hasType && !p.types.some(t => filters.types.includes(t.type.name))) return false;
		if (hasGen  && !filters.generations!.some(g => parseInt(g.toString()) === genFromId(p.id))) return false;
		return true;
	});
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
				// Fetch all name matches, then apply type/gen filters client-side
				const raw = await PokemonService.searchPokemon(query, 1000);
				const filtered = applyClientFilters(raw, filters);
				return {
					pokemons: filtered.slice(offset, offset + limit),
					hasMore: filtered.length > offset + limit,
					totalResults: filtered.length
				};
			} else {
				const filterResult = await PokemonService.fetchPokemonWithFilters(filters, limit, offset);
				return {
					pokemons: filterResult.pokemons,
					hasMore: filterResult.hasMore,
					totalResults: filterResult.totalResults
				};
			}
		} catch (error) {
			console.error('Search service error:', error);
			return { pokemons: [], hasMore: false, totalResults: 0 };
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
				const raw = await PokemonService.searchPokemon(query, 1000);
				const filtered = applyClientFilters(raw, filters);
				return {
					pokemons: [...currentPokemons, ...filtered.slice(offset, offset + limit)],
					hasMore: filtered.length > offset + limit,
					totalResults: filtered.length
				};
			} else {
				const filterResult = await PokemonService.fetchPokemonWithFilters(filters, limit, offset);
				return {
					pokemons: [...currentPokemons, ...filterResult.pokemons],
					hasMore: filterResult.hasMore,
					totalResults: filterResult.totalResults
				};
			}
		} catch (error) {
			console.error('Load more service error:', error);
			return { pokemons: currentPokemons, hasMore: false, totalResults: currentPokemons.length };
		}
	}
}