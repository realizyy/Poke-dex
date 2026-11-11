import { HttpError, fetchJson } from '#lib/api/http';
import { TtlCache } from '#lib/api/ttl-cache';
import type { TcgCard, TcgCardBrief, TcgSet, TcgSetBrief, TcgSeries } from '#lib/types';

const TCG_API_BASE = 'https://api.tcgdex.net/v2/en';

const cache = new TtlCache(300);

const TTL_LONG = 30 * 60 * 1000;
const TTL_SHORT = 10 * 60 * 1000;

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
		return cache.getOrLoad('series:all', TTL_LONG, () =>
			fetchJson<TcgSeries[]>(`${TCG_API_BASE}/series`)
		);
	}

	/** All sets (brief) */
	static async fetchSets(): Promise<TcgSetBrief[]> {
		return cache.getOrLoad('sets:all', TTL_LONG, () =>
			fetchJson<TcgSetBrief[]>(`${TCG_API_BASE}/sets`)
		);
	}

	/** Single set with its card list */
	static async fetchSet(id: string): Promise<TcgSet> {
		return cache.getOrLoad(`set:${id}`, TTL_LONG, () =>
			fetchJson<TcgSet>(`${TCG_API_BASE}/sets/${encodeURIComponent(id)}`)
		);
	}

	/** Single card detail */
	static async fetchCard(id: string): Promise<TcgCard> {
		return cache.getOrLoad(`card:${id}`, TTL_SHORT, () =>
			fetchJson<TcgCard>(`${TCG_API_BASE}/cards/${encodeURIComponent(id)}`)
		);
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
		return cache.getOrLoad(`cards:search:${qs}`, TTL_SHORT, () =>
			fetchJson<TcgCardBrief[]>(`${TCG_API_BASE}/cards?${qs}`)
		);
	}

	/**
	 * Fetch TCG cards for a specific Pokémon by name (for use in the Pokémon
	 * detail page modal). Uses laxist name matching (TCGDex default).
	 */
	static async fetchCardsByPokemonName(pokemonName: string): Promise<TcgCardBrief[]> {
		const params = new URLSearchParams({
			name: `eq:${pokemonName}`,
			'pagination:itemsPerPage': '60'
		});
		try {
			return await cache.getOrLoad(`cards:pokemon:${pokemonName.toLowerCase()}`, TTL_SHORT, () =>
				fetchJson<TcgCardBrief[]>(`${TCG_API_BASE}/cards?${params.toString()}`)
			);
		} catch (error) {
			if (error instanceof HttpError) return [];
			throw error;
		}
	}

	/** Helpers */
	static cardImageUrl(baseUrl: string, quality: 'high' | 'low' = 'high'): string {
		return `${baseUrl}/${quality}.webp`;
	}

	static cardImageUrlPng(baseUrl: string): string {
		return `${baseUrl}/high.png`;
	}
}
