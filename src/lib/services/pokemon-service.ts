import type { Pokemon, PokemonSpecies, SearchFilters } from '$lib/types';

const POKEMON_API_BASE = 'https://pokeapi.co/api/v2';
const POKEMON_CACHE = new Map<string, any>();

export class PokemonService {
	static async fetchPokemon(id: number): Promise<Pokemon> {
		const cacheKey = `pokemon-${id}`;
		
		if (POKEMON_CACHE.has(cacheKey)) {
			return POKEMON_CACHE.get(cacheKey);
		}
		
		const response = await fetch(`${POKEMON_API_BASE}/pokemon/${id}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch Pokemon with id ${id}`);
		}
		
		const pokemon = await response.json();
		POKEMON_CACHE.set(cacheKey, pokemon);
		return pokemon;
	}
	
	static async fetchPokemonSpecies(id: number): Promise<PokemonSpecies> {
		const cacheKey = `species-${id}`;
		
		if (POKEMON_CACHE.has(cacheKey)) {
			return POKEMON_CACHE.get(cacheKey);
		}
		
		const response = await fetch(`${POKEMON_API_BASE}/pokemon-species/${id}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch Pokemon species with id ${id}`);
		}
		
		const species = await response.json();
		POKEMON_CACHE.set(cacheKey, species);
		return species;
	}
	
	static async fetchPokemonList(limit: number = 1000, offset: number = 0): Promise<{results: {name: string, url: string}[], count: number}> {
		const cacheKey = `list-${limit}-${offset}`;
		
		if (POKEMON_CACHE.has(cacheKey)) {
			return POKEMON_CACHE.get(cacheKey);
		}
		
		const response = await fetch(`${POKEMON_API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
		if (!response.ok) {
			throw new Error('Failed to fetch Pokemon list');
		}
		
		const data = await response.json();
		POKEMON_CACHE.set(cacheKey, data);
		return data;
	}
	
	static async searchPokemon(query: string, limit: number = 20): Promise<Pokemon[]> {
		const pokemonList = await this.fetchPokemonList(1000);
		const filteredNames = pokemonList.results
			.filter(p => p.name.toLowerCase().includes(query.toLowerCase()))
			.slice(0, limit);
		
		const pokemonPromises = filteredNames.map(p => {
			const id = this.extractIdFromUrl(p.url);
			return this.fetchPokemon(id);
		});
		
		return Promise.all(pokemonPromises);
	}
	
	static async fetchPokemonBatch(ids: number[]): Promise<Pokemon[]> {
		const promises = ids.map(id => this.fetchPokemon(id));
		return Promise.all(promises);
	}
	
	static async fetchPokemonWithFilters(filters: SearchFilters, limit: number = 50, offset: number = 0): Promise<{pokemons: Pokemon[], hasMore: boolean}> {
		// For simplicity, we'll fetch a large batch and filter client-side
		// In a real app, you'd want server-side filtering
		const allPokemon = await this.fetchPokemonRange(1, Math.min(1000, offset + limit * 2));
		
		let filtered = allPokemon.filter(pokemon => {
			// Filter by types
			if (filters.types.length > 0) {
				const hasMatchingType = pokemon.types.some(t => 
					filters.types.includes(t.type.name)
				);
				if (!hasMatchingType) return false;
			}
			
			// Filter by stats
			if (filters.minStats || filters.maxStats) {
				const stats = this.getPokemonStats(pokemon);
				
				if (filters.minStats) {
					for (const [statName, minValue] of Object.entries(filters.minStats)) {
						if (minValue && stats[statName] < minValue) return false;
					}
				}
				
				if (filters.maxStats) {
					for (const [statName, maxValue] of Object.entries(filters.maxStats)) {
						if (maxValue && stats[statName] > maxValue) return false;
					}
				}
			}
			
			return true;
		});
		
		const paginatedResults = filtered.slice(offset, offset + limit);
		const hasMore = filtered.length > offset + limit;
		
		return {
			pokemons: paginatedResults,
			hasMore
		};
	}
	
	static async fetchPokemonRange(start: number, end: number): Promise<Pokemon[]> {
		const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
		return this.fetchPokemonBatch(ids);
	}
	
	private static extractIdFromUrl(url: string): number {
		const matches = url.match(/\/(\d+)\/$/);
		return matches ? parseInt(matches[1]) : 0;
	}
	
	private static getPokemonStats(pokemon: Pokemon): {[key: string]: number} {
		const stats: {[key: string]: number} = {};
		pokemon.stats.forEach(stat => {
			const statName = stat.stat.name.replace('-', '');
			stats[statName] = stat.base_stat;
		});
		return stats;
	}
}
