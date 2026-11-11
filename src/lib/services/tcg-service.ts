import { HttpError, fetchJson, mapWithConcurrency } from '#lib/api/http';
import { TtlCache } from '#lib/api/ttl-cache';
import { DEFAULT_PAGE_SIZE, buildCardSearchParams, type CardSearchFilters } from '#lib/utils/tcg';
import { DEFAULT_TCG_LANG, type TcgLang } from '#lib/utils/tcg-lang';
import type { TcgCard, TcgCardBrief, TcgSet, TcgSetBrief, TcgSeriesDetail } from '#lib/types';

const apiBase = (lang: TcgLang) => `https://api.tcgdex.net/v2/${lang}`;

const cache = new TtlCache(400);

const TTL_LONG = 30 * 60 * 1000;
const TTL_SHORT = 10 * 60 * 1000;
const SERIES_CONCURRENCY = 6;

export class TcgService {
	/** One series with its sets. The list endpoint only returns ids and names. */
	static async fetchSerie(id: string, lang: TcgLang = DEFAULT_TCG_LANG): Promise<TcgSeriesDetail> {
		return cache.getOrLoad(`${lang}:serie:${id}`, TTL_LONG, async () => {
			const serie = await fetchJson<TcgSeriesDetail>(
				`${apiBase(lang)}/series/${encodeURIComponent(id)}`
			);
			return { ...serie, sets: serie.sets ?? [] };
		});
	}

	/** Every series with its sets, newest release first. A series that fails to load is skipped. */
	static async fetchSeriesWithSets(lang: TcgLang = DEFAULT_TCG_LANG): Promise<TcgSeriesDetail[]> {
		const list = await cache.getOrLoad(`${lang}:series:list`, TTL_LONG, () =>
			fetchJson<{ id: string; name: string }[]>(`${apiBase(lang)}/series`)
		);
		const loaded = await mapWithConcurrency(list, SERIES_CONCURRENCY, (item) =>
			this.fetchSerie(item.id, lang).catch(() => null)
		);
		return loaded
			.filter((serie): serie is TcgSeriesDetail => serie !== null && serie.sets.length > 0)
			.sort((a, b) => (b.releaseDate ?? '').localeCompare(a.releaseDate ?? ''));
	}

	/** All sets (brief) */
	static async fetchSets(lang: TcgLang = DEFAULT_TCG_LANG): Promise<TcgSetBrief[]> {
		return cache.getOrLoad(`${lang}:sets:all`, TTL_LONG, () =>
			fetchJson<TcgSetBrief[]>(`${apiBase(lang)}/sets`)
		);
	}

	/** Single set with its card list */
	static async fetchSet(id: string, lang: TcgLang = DEFAULT_TCG_LANG): Promise<TcgSet> {
		return cache.getOrLoad(`${lang}:set:${id}`, TTL_LONG, () =>
			fetchJson<TcgSet>(`${apiBase(lang)}/sets/${encodeURIComponent(id)}`)
		);
	}

	/** Single card detail */
	static async fetchCard(id: string, lang: TcgLang = DEFAULT_TCG_LANG): Promise<TcgCard> {
		return cache.getOrLoad(`${lang}:card:${id}`, TTL_SHORT, () =>
			fetchJson<TcgCard>(`${apiBase(lang)}/cards/${encodeURIComponent(id)}`)
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
		const lang = filters.lang ?? DEFAULT_TCG_LANG;
		const qs = buildCardSearchParams(filters).toString();
		return cache.getOrLoad(`${lang}:cards:search:${qs}`, TTL_SHORT, () =>
			fetchJson<TcgCardBrief[]>(`${apiBase(lang)}/cards?${qs}`)
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
			return await cache.getOrLoad(`en:cards:pokemon:${pokemonName.toLowerCase()}`, TTL_SHORT, () =>
				fetchJson<TcgCardBrief[]>(`${apiBase('en')}/cards?${params.toString()}`)
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
