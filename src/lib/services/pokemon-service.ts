import type { Pokemon, PokemonSpecies, SearchFilters } from '$lib/types';

const POKEMON_API_BASE = 'https://pokeapi.co/api/v2';
const POKEMON_CACHE = new Map<string, any>();

// Enhanced caching with TTL and preload strategies
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const CACHE_METADATA = new Map<string, { timestamp: number, expiry: number }>();

// Popular/Featured Pokemon IDs that should be preloaded
const FEATURED_POKEMON_IDS = [1, 4, 7, 25, 39, 52, 54, 74, 104, 113, 133, 143, 150, 151, 251, 384, 493];
const INITIAL_BATCH_SIZE = 50;

export class PokemonService {
	// Cache management methods
	private static isCacheValid(cacheKey: string): boolean {
		const metadata = CACHE_METADATA.get(cacheKey);
		if (!metadata) return false;
		return Date.now() < metadata.expiry;
	}

	private static setCacheWithTTL(key: string, data: any, ttl: number = CACHE_TTL): void {
		POKEMON_CACHE.set(key, data);
		CACHE_METADATA.set(key, {
			timestamp: Date.now(),
			expiry: Date.now() + ttl
		});
	}

	private static getCachedData(key: string): any | null {
		if (this.isCacheValid(key)) {
			return POKEMON_CACHE.get(key);
		}
		// Clean expired cache
		POKEMON_CACHE.delete(key);
		CACHE_METADATA.delete(key);
		return null;
	}

	// Preload strategies
	static async preloadFeaturedPokemon(): Promise<void> {
		const uncachedIds = FEATURED_POKEMON_IDS.filter(id => 
			!this.isCacheValid(`pokemon-${id}`)
		);
		
		if (uncachedIds.length > 0) {
			// Background preload without blocking
			this.fetchPokemonBatch(uncachedIds).catch(console.error);
		}
	}

	static async preloadInitialBatch(): Promise<Pokemon[]> {
		const cacheKey = 'initial-batch-50';
		const cached = this.getCachedData(cacheKey);
		
		if (cached) {
			return cached;
		}

		const pokemon = await this.fetchPokemonRange(1, INITIAL_BATCH_SIZE);
		this.setCacheWithTTL(cacheKey, pokemon, CACHE_TTL * 2); // Longer TTL for initial batch
		return pokemon;
	}

	static async fetchPokemon(id: number): Promise<Pokemon> {
		const cacheKey = `pokemon-${id}`;
		const cached = this.getCachedData(cacheKey);
		
		if (cached) {
			return cached;
		}
		
		const response = await fetch(`${POKEMON_API_BASE}/pokemon/${id}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch Pokemon with id ${id}`);
		}
		
		const pokemon = await response.json();
		this.setCacheWithTTL(cacheKey, pokemon);
		return pokemon;
	}
	
	static async fetchPokemonSpecies(id: number): Promise<PokemonSpecies> {
		const cacheKey = `species-${id}`;
		const cached = this.getCachedData(cacheKey);
		
		if (cached) {
			return cached;
		}
		
		const response = await fetch(`${POKEMON_API_BASE}/pokemon-species/${id}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch Pokemon species with id ${id}`);
		}
		
		const species = await response.json();
		this.setCacheWithTTL(cacheKey, species);
		return species;
	}

	static async fetchEvolutionChain(chainId: number): Promise<any> {
		const cacheKey = `evolution-chain-${chainId}`;
		const cached = this.getCachedData(cacheKey);
		
		if (cached) {
			return cached;
		}
		
		const response = await fetch(`${POKEMON_API_BASE}/evolution-chain/${chainId}`);
		if (!response.ok) {
			throw new Error(`Failed to fetch evolution chain with id ${chainId}`);
		}
		
		const evolutionChain = await response.json();
		this.setCacheWithTTL(cacheKey, evolutionChain);
		return evolutionChain;
	}

	static async getEvolutionChainForPokemon(pokemonId: number): Promise<any> {
		try {
			// First get the species to find the evolution chain URL
			const species = await this.fetchPokemonSpecies(pokemonId);
			const evolutionChainUrl = species.evolution_chain?.url;
			
			if (!evolutionChainUrl) {
				return null;
			}
			
			// Extract chain ID from URL
			const chainId = this.extractIdFromUrl(evolutionChainUrl);
			return await this.fetchEvolutionChain(chainId);
		} catch (error) {
			console.error('Error fetching evolution chain:', error);
			return null;
		}
	}
	
	static async fetchPokemonList(limit: number = 1000, offset: number = 0): Promise<{results: {name: string, url: string}[], count: number}> {
		const cacheKey = `list-${limit}-${offset}`;
		const cached = this.getCachedData(cacheKey);
		
		if (cached) {
			return cached;
		}
		
		const response = await fetch(`${POKEMON_API_BASE}/pokemon?limit=${limit}&offset=${offset}`);
		if (!response.ok) {
			throw new Error('Failed to fetch Pokemon list');
		}
		
		const data = await response.json();
		this.setCacheWithTTL(cacheKey, data, CACHE_TTL * 3); // Longer TTL for list data
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
		// Separate cached and uncached IDs
		const cached: Pokemon[] = [];
		const uncachedIds: number[] = [];
		
		ids.forEach(id => {
			const cachedPokemon = this.getCachedData(`pokemon-${id}`);
			if (cachedPokemon) {
				cached.push(cachedPokemon);
			} else {
				uncachedIds.push(id);
			}
		});
		
		// Fetch uncached Pokemon in batches to avoid overwhelming the API
		const batchSize = 10;
		const uncachedPromises: Promise<Pokemon>[] = [];
		
		for (let i = 0; i < uncachedIds.length; i += batchSize) {
			const batch = uncachedIds.slice(i, i + batchSize);
			const batchPromises = batch.map(id => this.fetchPokemon(id));
			uncachedPromises.push(...batchPromises);
		}
		
		const uncachedResults = await Promise.all(uncachedPromises);
		
		// Combine and sort by original order
		const allResults = [...cached, ...uncachedResults];
		return ids.map(id => allResults.find(p => p.id === id)).filter(Boolean) as Pokemon[];
	}
	
	static async fetchPokemonWithFilters(filters: SearchFilters, limit: number = 50, offset: number = 0): Promise<{pokemons: Pokemon[], hasMore: boolean}> {
		// Don't fetch anything if no filters are active and no query
		const hasActiveFilters = filters.types.length > 0 || 
			(filters.minStats && Object.keys(filters.minStats).length > 0) ||
			(filters.maxStats && Object.keys(filters.maxStats).length > 0);
		
		if (!hasActiveFilters) {
			return {
				pokemons: [],
				hasMore: false
			};
		}

		// For complex filters, fetch a reasonable range and filter client-side
		const fetchSize = Math.min(1000, offset + limit * 2);
		const allPokemon = await this.fetchPokemonRange(1, fetchSize);
		
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
		const cacheKey = `range-${start}-${end}`;
		const cached = this.getCachedData(cacheKey);
		
		if (cached) {
			return cached;
		}
		
		const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
		const results = await this.fetchPokemonBatch(ids);
		
		// Cache the range result
		this.setCacheWithTTL(cacheKey, results, CACHE_TTL * 2);
		return results;
	}

	// Cache statistics and management
	static getCacheStats(): { size: number, hitRate: number, memoryUsage: string } {
		const cacheSize = POKEMON_CACHE.size;
		const memoryUsage = `${Math.round(JSON.stringify(Array.from(POKEMON_CACHE.values())).length / 1024 / 1024)} MB`;
		
		return {
			size: cacheSize,
			hitRate: 0, // Could be implemented with hit/miss counters
			memoryUsage
		};
	}

	static clearExpiredCache(): void {
		const now = Date.now();
		CACHE_METADATA.forEach((metadata, key) => {
			if (now >= metadata.expiry) {
				POKEMON_CACHE.delete(key);
				CACHE_METADATA.delete(key);
			}
		});
	}

	static clearAllCache(): void {
		POKEMON_CACHE.clear();
		CACHE_METADATA.clear();
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
