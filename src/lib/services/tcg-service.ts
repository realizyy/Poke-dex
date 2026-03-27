import type { TcgCard, TcgCardBrief, TcgSet, TcgSetBrief, TcgSeries } from '$lib/types';

const TCG_API_BASE = 'https://api.tcgdex.net/v2/en';

// Cache with TTL — same pattern as pokemon-service.ts
const TCG_CACHE = new Map<string, unknown>();
const CACHE_METADATA = new Map<string, { expiry: number }>();

const TTL_LONG = 30 * 60 * 1000;  // 30 min — sets & series rarely change
const TTL_SHORT = 10 * 60 * 1000; // 10 min — card search results

async function fetchWithRetry(url: string, retries = 3, timeoutMs = 20000): Promise<Response> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= retries; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const response = await fetch(url, { signal: controller.signal });
			clearTimeout(timer);
			return response;
		} catch (err) {
			clearTimeout(timer);
			lastError = err;
			if (attempt < retries) {
				await new Promise((r) => setTimeout(r, attempt * 600));
			}
		}
	}
	throw lastError;
}

function isCacheValid(key: string): boolean {
	const meta = CACHE_METADATA.get(key);
	return !!meta && Date.now() < meta.expiry;
}

function setCache<T>(key: string, data: T, ttl: number): T {
	TCG_CACHE.set(key, data);
	CACHE_METADATA.set(key, { expiry: Date.now() + ttl });
	return data;
}

function getCache<T>(key: string): T | undefined {
	return TCG_CACHE.get(key) as T | undefined;
}

export interface CardSearchFilters {
	name?: string;
	types?: string;
	rarity?: string;
	hpMin?: number;
	hpMax?: number;
	setId?: string;
	page?: number;
	itemsPerPage?: number;
}

export class TcgService {
	/** All TCG series (each containing their sets) */
	static async fetchSeries(): Promise<TcgSeries[]> {
		const key = 'series:all';
		if (isCacheValid(key)) return getCache<TcgSeries[]>(key) ?? [];
		const res = await fetchWithRetry(`${TCG_API_BASE}/series`);
		if (!res.ok) throw new Error(`TCG API error: ${res.status}`);
		const data: TcgSeries[] = await res.json();
		return setCache(key, data, TTL_LONG);
	}

	/** All sets (brief) */
	static async fetchSets(): Promise<TcgSetBrief[]> {
		const key = 'sets:all';
		if (isCacheValid(key)) return getCache<TcgSetBrief[]>(key) ?? [];
		const res = await fetchWithRetry(`${TCG_API_BASE}/sets`);
		if (!res.ok) throw new Error(`TCG API error: ${res.status}`);
		const data: TcgSetBrief[] = await res.json();
		return setCache(key, data, TTL_LONG);
	}

	/** Single set with its card list */
	static async fetchSet(id: string): Promise<TcgSet> {
		const key = `set:${id}`;
		if (isCacheValid(key)) return getCache<TcgSet>(key)!;
		const res = await fetchWithRetry(`${TCG_API_BASE}/sets/${encodeURIComponent(id)}`);
		if (!res.ok) throw new Error(`TCG set not found: ${id}`);
		const data: TcgSet = await res.json();
		return setCache(key, data, TTL_LONG);
	}

	/** Single card detail */
	static async fetchCard(id: string): Promise<TcgCard> {
		const key = `card:${id}`;
		if (isCacheValid(key)) return getCache<TcgCard>(key)!;
		const res = await fetchWithRetry(`${TCG_API_BASE}/cards/${encodeURIComponent(id)}`);
		if (!res.ok) throw new Error(`TCG card not found: ${id}`);
		const data: TcgCard = await res.json();
		return setCache(key, data, TTL_SHORT);
	}

	/** Search cards with optional filters, sort, and pagination */
	static async searchCards(filters: CardSearchFilters = {}): Promise<TcgCardBrief[]> {
		const params = new URLSearchParams();

		if (filters.name) params.set('name', filters.name);
		if (filters.types) params.set('types', filters.types);
		if (filters.rarity) params.set('rarity', filters.rarity);
		if (filters.hpMin != null) params.set('hp', `gte:${filters.hpMin}`);
		if (filters.hpMax != null) {
			// If both min & max, we can only add one hp param — append separately
			const existing = params.get('hp');
			if (existing) {
				// Use two separate params (API supports duplicates)
				params.append('hp', `lte:${filters.hpMax}`);
			} else {
				params.set('hp', `lte:${filters.hpMax}`);
			}
		}
		if (filters.setId) params.set('set.id', `eq:${filters.setId}`);

		const page = filters.page ?? 1;
		const itemsPerPage = filters.itemsPerPage ?? 24;
		params.set('pagination:page', String(page));
		params.set('pagination:itemsPerPage', String(itemsPerPage));

		const qs = params.toString();
		const key = `cards:search:${qs}`;
		if (isCacheValid(key)) return getCache<TcgCardBrief[]>(key) ?? [];

		const res = await fetchWithRetry(`${TCG_API_BASE}/cards?${qs}`);
		if (!res.ok) throw new Error(`TCG search error: ${res.status}`);
		const data: TcgCardBrief[] = await res.json();
		return setCache(key, data, TTL_SHORT);
	}

	/**
	 * Fetch TCG cards for a specific Pokémon by name (for use in the Pokémon
	 * detail page modal). Uses laxist name matching (TCGDex default).
	 */
	static async fetchCardsByPokemonName(pokemonName: string): Promise<TcgCardBrief[]> {
		const key = `cards:pokemon:${pokemonName.toLowerCase()}`;
		if (isCacheValid(key)) return getCache<TcgCardBrief[]>(key) ?? [];
		const params = new URLSearchParams({
			name: `eq:${pokemonName}`,
			'pagination:itemsPerPage': '60'
		});
		const res = await fetchWithRetry(`${TCG_API_BASE}/cards?${params.toString()}`);
		if (!res.ok) return [];
		const data: TcgCardBrief[] = await res.json();
		return setCache(key, data, TTL_SHORT);
	}

	/** Helpers */
	static cardImageUrl(baseUrl: string, quality: 'high' | 'low' = 'high'): string {
		return `${baseUrl}/${quality}.webp`;
	}

	static cardImageUrlPng(baseUrl: string): string {
		return `${baseUrl}/high.png`;
	}
}
