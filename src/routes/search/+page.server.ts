import type { PageServerLoad } from './$types';
import { PokemonService } from '$lib/services/pokemon-service';

export const load: PageServerLoad = async ({ url }) => {
	const searchParams = url.searchParams;
	const query = searchParams.get('q') || '';
	const limit = parseInt(searchParams.get('limit') || '50');
	const offset = parseInt(searchParams.get('offset') || '0');
	
	// Parse filters from URL
	const typeFilter = searchParams.get('types')?.split(',').filter(Boolean) || [];
	const genFilter = searchParams.get('generations')?.split(',').filter(Boolean) || [];
	
	const filters = {
		types: typeFilter,
		generations: genFilter,
		minStats: {},
		maxStats: {}
	};
	
	try {
		// Only perform search if there's an explicit query or filters
		if (query || typeFilter.length > 0 || genFilter.length > 0) {
			let result;
			if (query) {
				const searchResults = await PokemonService.searchPokemon(query, limit);
				result = {
					pokemons: searchResults,
					hasMore: searchResults.length >= limit
				};
			} else {
				result = await PokemonService.fetchPokemonWithFilters(filters, limit, offset);
			}
			
			return {
				pokemons: result.pokemons,
				hasMore: result.hasMore,
				query,
				filters,
				offset
			};
		} else {
			// Return empty state for initial page load
			return {
				pokemons: [],
				hasMore: false,
				query: '',
				filters: { types: [], generations: [] },
				offset: 0
			};
		}
	} catch (error) {
		console.error('Error loading Pokemon:', error);
		return {
			pokemons: [],
			hasMore: false,
			query: '',
			filters: { types: [], generations: [] },
			offset: 0
		};
	}
};
