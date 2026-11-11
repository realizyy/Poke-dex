import { browser } from '$app/env';
import { HttpError, fetchJson, mapWithConcurrency } from '#lib/api/http';
import { TtlCache } from '#lib/api/ttl-cache';
import type {
	Pokemon,
	PokemonSpecies,
	SearchFilters,
	EncounterArea,
	EvolutionChain
} from '#lib/types';
import { toastStore } from '#lib/stores/toast-store.svelte';

const POKEMON_API_BASE = 'https://pokeapi.co/api/v2';
const FETCH_CONCURRENCY = 20;

const cache = new TtlCache(800);

const CACHE_TTL = 10 * 60 * 1000;

// ID ranges per generation — used to limit fetches when a gen filter is active
const GENERATION_ID_RANGES: Record<number, [number, number]> = {
	1: [1, 151],
	2: [152, 251],
	3: [252, 386],
	4: [387, 493],
	5: [494, 649],
	6: [650, 721],
	7: [722, 809],
	8: [810, 905],
	9: [906, 1025]
};

export class PokemonService {
	static async fetchPokemon(id: number): Promise<Pokemon> {
		return cache.getOrLoad(`pokemon-${id}`, CACHE_TTL, async () => {
			try {
				return await fetchJson<Pokemon>(`${POKEMON_API_BASE}/pokemon/${id}`);
			} catch (error) {
				if (browser) {
					if (error instanceof HttpError && error.status === 404) {
						toastStore.error('Pokemon Not Found', `Could not find Pokemon with ID ${id}`);
					} else {
						toastStore.error(
							'Network Error',
							'Failed to load Pokemon data. Please check your connection.'
						);
					}
				}
				throw error;
			}
		});
	}

	static async fetchPokemonByName(name: string): Promise<Pokemon> {
		const key = name.toLowerCase().trim();
		return cache.getOrLoad(`pokemon-${key}`, CACHE_TTL, () =>
			fetchJson<Pokemon>(`${POKEMON_API_BASE}/pokemon/${encodeURIComponent(key)}`)
		);
	}

	static async fetchPokemonSpecies(id: number): Promise<PokemonSpecies> {
		return cache.getOrLoad(`species-${id}`, CACHE_TTL, () =>
			fetchJson<PokemonSpecies>(`${POKEMON_API_BASE}/pokemon-species/${id}`)
		);
	}

	static async fetchEncounters(pokemonId: number): Promise<EncounterArea[]> {
		return cache.getOrLoad(`encounters-${pokemonId}`, 15 * 60 * 1000, () =>
			fetchJson<EncounterArea[]>(`${POKEMON_API_BASE}/pokemon/${pokemonId}/encounters`)
		);
	}

	static async fetchEvolutionChain(chainId: number): Promise<EvolutionChain> {
		return cache.getOrLoad(`evolution-chain-${chainId}`, CACHE_TTL, () =>
			fetchJson<EvolutionChain>(`${POKEMON_API_BASE}/evolution-chain/${chainId}`)
		);
	}

	static async getEvolutionChainForPokemon(pokemonId: number): Promise<EvolutionChain | null> {
		try {
			const species = await this.fetchPokemonSpecies(pokemonId);
			const evolutionChainUrl = species.evolution_chain?.url;
			if (!evolutionChainUrl) return null;
			return await this.fetchEvolutionChain(this.extractIdFromUrl(evolutionChainUrl));
		} catch (error) {
			console.error('Error fetching evolution chain:', error);
			return null;
		}
	}

	static async fetchPokemonList(
		limit: number = 1000,
		offset: number = 0
	): Promise<{ results: { name: string; url: string }[]; count: number }> {
		return cache.getOrLoad(`list-${limit}-${offset}`, CACHE_TTL * 3, () =>
			fetchJson(`${POKEMON_API_BASE}/pokemon?limit=${limit}&offset=${offset}`)
		);
	}

	static async searchPokemon(query: string, limit: number = 20): Promise<Pokemon[]> {
		const pokemonList = await this.fetchPokemonList(1000);
		const filteredNames = pokemonList.results
			.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
			.slice(0, limit);

		const pokemonPromises = filteredNames.map((p) => {
			const id = this.extractIdFromUrl(p.url);
			return this.fetchPokemon(id);
		});

		return Promise.all(pokemonPromises);
	}

	static async fetchPokemonBatch(ids: number[]): Promise<Pokemon[]> {
		return mapWithConcurrency(ids, FETCH_CONCURRENCY, (id) => this.fetchPokemon(id));
	}

	/**
	 * Fetches the list of Pokémon IDs that belong to a given type via the /type endpoint.
	 * Returns IDs ≤ 10000 (filters out non-standard forms above that range).
	 */
	static async fetchIdsByType(typeName: string): Promise<number[]> {
		return cache.getOrLoad(`type-ids-${typeName}`, CACHE_TTL * 3, async () => {
			const data = await fetchJson<{ pokemon: { pokemon: { url: string } }[] }>(
				`${POKEMON_API_BASE}/type/${typeName}`
			);
			return data.pokemon
				.map((entry) => this.extractIdFromUrl(entry.pokemon.url))
				.filter((id) => id <= 10000);
		});
	}

	static async fetchPokemonWithFilters(
		filters: SearchFilters,
		limit: number = 50,
		offset: number = 0
	): Promise<{ pokemons: Pokemon[]; hasMore: boolean; totalResults: number }> {
		const hasTypeFilter = filters.types.length > 0;
		const hasGenFilter = filters.generations && filters.generations.length > 0;
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
			const typeLists = await Promise.all(filters.types.map((t) => this.fetchIdsByType(t)));
			const unionSet = new Set<number>();
			for (const list of typeLists) list.forEach((id) => unionSet.add(id));
			idsToFetch = Array.from(unionSet);

			// Intersect with generation ranges if a gen filter is also active
			if (hasGenFilter) {
				const genSet = new Set<number>();
				for (const gen of filters.generations!) {
					const range = GENERATION_ID_RANGES[parseInt(gen.toString())];
					if (range) for (let id = range[0]; id <= range[1]; id++) genSet.add(id);
				}
				idsToFetch = idsToFetch.filter((id) => genSet.has(id));
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

		const filtered = allPokemon.filter((pokemon) => {
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
		return cache.getOrLoad(`range-${start}-${end}`, CACHE_TTL * 2, () => {
			const ids = Array.from({ length: end - start + 1 }, (_, i) => start + i);
			return this.fetchPokemonBatch(ids);
		});
	}

	static getCacheStats(): { size: number; hitRate: number; capacity: string } {
		return {
			size: cache.size,
			hitRate: Math.round(cache.hitRate * 100),
			capacity: `${cache.size} / ${cache.maxEntries}`
		};
	}

	static clearExpiredCache(): void {
		cache.prune();
	}

	static clearAllCache(): void {
		cache.clear();
	}

	private static extractIdFromUrl(url: string): number {
		const matches = url.match(/\/(\d+)\/$/);
		return matches ? parseInt(matches[1]) : 0;
	}

	private static getPokemonStats(pokemon: Pokemon): { [key: string]: number } {
		const stats: { [key: string]: number } = {};
		pokemon.stats.forEach((stat) => {
			const statName = stat.stat.name.replace('-', '');
			stats[statName] = stat.base_stat;
		});
		return stats;
	}
}
