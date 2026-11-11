import { HttpError, fetchJson } from '#lib/api/http';
import { TtlCache } from '#lib/api/ttl-cache';
import { DEFAULT_PAGE_SIZE, buildCardSearchParams, type CardSearchFilters } from '#lib/utils/tcg';
import type { TcgCard, TcgCardBrief, TcgSet, TcgSetBrief, TcgSeries } from '#lib/types';

const TCG_API_BASE = 'https://api.tcgdex.net/v2/en';

const cache = new TtlCache(300);

const TTL_LONG = 30 * 60 * 1000;
const TTL_SHORT = 10 * 60 * 1000;

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

	/** One page of cards plus whether a next page exists. The next page is fetched into the cache. */
	static async searchCards(
		filters: CardSearchFilters = {}
	): Promise<{ cards: TcgCardBrief[]; hasMore: boolean }> {
		const size = filters.itemsPerPage ?? DEFAULT_PAGE_SIZE;
		const page = filters.page ?? 1;
		const cards = await this.fetchCardPage({ ...filters, page, itemsPerPage: size });
		if (cards.length < size) return { cards, hasMore: false };
		const next = await this.fetchCardPage({ ...filters, page: page + 1, itemsPerPage: size }).catch(
			() => []
		);
		return { cards, hasMore: next.length > 0 };
	}

	private static fetchCardPage(filters: CardSearchFilters): Promise<TcgCardBrief[]> {
		const qs = buildCardSearchParams(filters).toString();
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
