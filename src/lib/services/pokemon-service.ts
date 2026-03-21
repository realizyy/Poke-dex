import type { Pokemon, PokemonSpecies, SearchFilters, EncounterArea } from '$lib/types';
import { toastStore } from '$lib/stores/toast-store';

const POKEMON_API_BASE = 'https://pokeapi.co/api/v2';
const POKEMON_CACHE = new Map<string, any>();

// Enhanced caching with TTL and preload strategies
const CACHE_TTL = 10 * 60 * 1000; // 10 minutes
const CACHE_METADATA = new Map<string, { timestamp: number, expiry: number }>();

// Popular/Featured Pokemon IDs that should be preloaded
const FEATURED_POKEMON_IDS = [1, 4, 7, 25, 39, 52, 54, 74, 104, 113, 133, 143, 150, 151, 251, 384, 493];
const INITIAL_BATCH_SIZE = 50;

// ID ranges per generation — used to limit fetches when a gen filter is active
const GENERATION_ID_RANGES: Record<number, [number, number]> = {
	1: [1, 151],   2: [152, 251], 3: [252, 386], 4: [387, 493],
	5: [494, 649], 6: [650, 721], 7: [722, 809], 8: [810, 905], 9: [906, 1025]
};

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
		
		try {
			const response = await fetch(`${POKEMON_API_BASE}/pokemon/${id}`);
			if (!response.ok) {
				toastStore.error('Pokemon Not Found', `Could not find Pokemon with ID ${id}`);
				throw new Error(`Failed to fetch Pokemon with id ${id}`);
			}
			
			const pokemon = await response.json();
			this.setCacheWithTTL(cacheKey, pokemon);
			return pokemon;
		} catch (error) {
			toastStore.error('Network Error', 'Failed to load Pokemon data. Please check your connection.');
			throw error;
		}
	}

	static async fetchPokemonByName(name: string): Promise<Pokemon> {
		const key = name.toLowerCase().trim();
		const cacheKey = `pokemon-${key}`;
		const cached = this.getCachedData(cacheKey);
		if (cached) return cached;
		const response = await fetch(`${POKEMON_API_BASE}/pokemon/${key}`);
		if (!response.ok) throw new Error(`Pokemon "${name}" not found`);
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

	static async fetchEncounters(pokemonId: number): Promise<EncounterArea[]> {
		const cacheKey = `encounters-${pokemonId}`;
		const cached = this.getCachedData(cacheKey);
		if (cached) return cached;
		const response = await fetch(`${POKEMON_API_BASE}/pokemon/${pokemonId}/encounters`);
		if (!response.ok) throw new Error(`Failed to fetch encounters for Pokemon ${pokemonId}`);
		const data: EncounterArea[] = await response.json();
		this.setCacheWithTTL(cacheKey, data, 15 * 60 * 1000);
		return data;
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
	
	/**
	 * Fetches the list of Pokémon IDs that belong to a given type via the /type endpoint.
	 * Returns IDs ≤ 10000 (filters out non-standard forms above that range).
	 */
	static async fetchIdsByType(typeName: string): Promise<number[]> {
		const cacheKey = `type-ids-${typeName}`;
		const cached = this.getCachedData(cacheKey);
		if (cached) return cached;

		const response = await fetch(`${POKEMON_API_BASE}/type/${typeName}`);
		if (!response.ok) throw new Error(`Failed to fetch type: ${typeName}`);

		const data = await response.json();
		const ids: number[] = data.pokemon
			.map((entry: { pokemon: { url: string } }) => this.extractIdFromUrl(entry.pokemon.url))
			.filter((id: number) => id <= 10000); // exclude non-standard form IDs

		this.setCacheWithTTL(cacheKey, ids, CACHE_TTL * 3); // type lists rarely change
		return ids;
	}

	static async fetchPokemonWithFilters(filters: SearchFilters, limit: number = 50, offset: number = 0): Promise<{pokemons: Pokemon[], hasMore: boolean, totalResults: number}> {
		const hasTypeFilter = filters.types.length > 0;
		const hasGenFilter  = filters.generations && filters.generations.length > 0;
		const hasStatFilter =
			(filters.minStats && Object.values(filters.minStats).some(Boolean)) ||
			(filters.maxStats && Object.values(filters.maxStats).some(Boolean));

		if (!hasTypeFilter && !hasGenFilter && !hasStatFilter) {
			return { pokemons: [], hasMore: false, totalResults: 0 };
		}

		let idsToFetch: number[];

		if (hasTypeFilter) {
			// Use the /type endpoint — fetches only the Pokémon for each selected type
			// (union: Pokémon that have ANY of the selected types)
			const typeLists = await Promise.all(filters.types.map(t => this.fetchIdsByType(t)));
			const unionSet = new Set<number>();
			for (const list of typeLists) list.forEach(id => unionSet.add(id));
			idsToFetch = Array.from(unionSet);

			// Intersect with generation ranges if a gen filter is also active
			if (hasGenFilter) {
				const genSet = new Set<number>();
				for (const gen of filters.generations!) {
					const range = GENERATION_ID_RANGES[parseInt(gen.toString())];
					if (range) for (let id = range[0]; id <= range[1]; id++) genSet.add(id);
				}
				idsToFetch = idsToFetch.filter(id => genSet.has(id));
			}
		} else if (hasGenFilter) {
			// Gen filter only — use known ID ranges
			idsToFetch = [];
			for (const gen of filters.generations!) {
				const range = GENERATION_ID_RANGES[parseInt(gen.toString())];
				if (range) for (let id = range[0]; id <= range[1]; id++) idsToFetch.push(id);
			}
		} else {
			// Stat filter only — must scan all Pokémon
			idsToFetch = Array.from({ length: 1025 }, (_, i) => i + 1);
		}

		// Sort by ID for consistent ordering
		idsToFetch.sort((a, b) => a - b);

		const allPokemon = await this.fetchPokemonBatch(idsToFetch);

		const filtered = allPokemon.filter(pokemon => {
			if (hasStatFilter) {
				const stats = this.getPokemonStats(pokemon);
				if (filters.minStats) {
					for (const [k, min] of Object.entries(filters.minStats)) {
						if (min && stats[k] < min) return false;
					}
				}
				if (filters.maxStats) {
					for (const [k, max] of Object.entries(filters.maxStats)) {
						if (max && stats[k] > max) return false;
					}
				}
			}
			return true;
		});

		return {
			pokemons: filtered.slice(offset, offset + limit),
			hasMore: filtered.length > offset + limit,
			totalResults: filtered.length
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
