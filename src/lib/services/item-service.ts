import type { Berry, Item, ItemCategory, ItemPocket } from '$lib/types';

const API_BASE = 'https://pokeapi.co/api/v2';
const CACHE = new Map<string, unknown>();
const CACHE_META = new Map<string, { expiry: number }>();

const TTL = {
	berry: 30 * 60 * 1000,
	item: 20 * 60 * 1000,
	pocket: 60 * 60 * 1000,
	category: 20 * 60 * 1000,
	list: 10 * 60 * 1000
};

function isValid(key: string): boolean {
	const meta = CACHE_META.get(key);
	if (!meta) return false;
	if (Date.now() > meta.expiry) {
		CACHE.delete(key);
		CACHE_META.delete(key);
		return false;
	}
	return true;
}

function set<T>(key: string, data: T, ttl: number): T {
	CACHE.set(key, data);
	CACHE_META.set(key, { expiry: Date.now() + ttl });
	return data;
}

function get<T>(key: string): T | null {
	return isValid(key) ? (CACHE.get(key) as T) : null;
}

async function fetchJSON<T>(url: string): Promise<T> {
	const res = await fetch(url);
	if (!res.ok) throw new Error(`PokeAPI error ${res.status}: ${url}`);
	return res.json() as Promise<T>;
}

async function batchFetch<T>(
	urls: string[],
	cacheKeyFn: (url: string) => string,
	ttl: number,
	batchSize = 10
): Promise<T[]> {
	const results: T[] = [];
	for (let i = 0; i < urls.length; i += batchSize) {
		const chunk = urls.slice(i, i + batchSize);
		const fetched = await Promise.all(
			chunk.map(async (url) => {
				const key = cacheKeyFn(url);
				const cached = get<T>(key);
				if (cached) return cached;
				const data = await fetchJSON<T>(url);
				return set(key, data, ttl);
			})
		);
		results.push(...fetched);
	}
	return results;
}

export class ItemService {
	// ─── Berries ─────────────────────────────────────────────────────────────

	static async fetchAllBerries(): Promise<Berry[]> {
		const key = 'all-berries';
		const cached = get<Berry[]>(key);
		if (cached) return cached;

		const list = await fetchJSON<{ results: { url: string }[] }>(
			`${API_BASE}/berry?limit=64`
		);
		const berries = await batchFetch<Berry>(
			list.results.map((r) => r.url),
			(url) => {
				const id = url.split('/').filter(Boolean).pop()!;
				return `berry-${id}`;
			},
			TTL.berry
		);
		return set(key, berries, TTL.berry);
	}

	static async fetchBerry(nameOrId: string | number): Promise<Berry> {
		const key = `berry-${nameOrId}`;
		const cached = get<Berry>(key);
		if (cached) return cached;
		const data = await fetchJSON<Berry>(`${API_BASE}/berry/${nameOrId}`);
		return set(key, data, TTL.berry);
	}

	// ─── Item Pockets ─────────────────────────────────────────────────────────

	static async fetchItemPockets(): Promise<ItemPocket[]> {
		const key = 'item-pockets';
		const cached = get<ItemPocket[]>(key);
		if (cached) return cached;

		const list = await fetchJSON<{ results: { url: string }[] }>(
			`${API_BASE}/item-pocket`
		);
		const pockets = await batchFetch<ItemPocket>(
			list.results.map((r) => r.url),
			(url) => {
				const id = url.split('/').filter(Boolean).pop()!;
				return `pocket-${id}`;
			},
			TTL.pocket
		);
		// Sort into a sensible display order
		const ORDER = ['pokeballs', 'medicine', 'hold-items', 'machines', 'misc', 'berries', 'mail', 'battle', 'key'];
		pockets.sort((a, b) => {
			const ia = ORDER.indexOf(a.name);
			const ib = ORDER.indexOf(b.name);
			return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
		});
		return set(key, pockets, TTL.pocket);
	}

	// ─── Item Categories ──────────────────────────────────────────────────────

	static async fetchItemCategory(categoryName: string): Promise<ItemCategory> {
		const key = `cat-${categoryName}`;
		const cached = get<ItemCategory>(key);
		if (cached) return cached;
		const data = await fetchJSON<ItemCategory>(`${API_BASE}/item-category/${categoryName}`);
		return set(key, data, TTL.category);
	}

	static async fetchItemsByCategory(categoryName: string): Promise<Item[]> {
		const key = `items-cat-${categoryName}`;
		const cached = get<Item[]>(key);
		if (cached) return cached;

		const cat = await this.fetchItemCategory(categoryName);
		const items = await batchFetch<Item>(
			cat.items.map((i) => `${API_BASE}/item/${i.name}`),
			(url) => {
				const name = url.split('/').filter(Boolean).pop()!;
				return `item-${name}`;
			},
			TTL.item
		);
		return set(key, items, TTL.category);
	}

	// ─── Items ────────────────────────────────────────────────────────────────

	static async fetchItem(nameOrId: string | number): Promise<Item> {
		const key = `item-${nameOrId}`;
		const cached = get<Item>(key);
		if (cached) return cached;
		const data = await fetchJSON<Item>(`${API_BASE}/item/${nameOrId}`);
		return set(key, data, TTL.item);
	}

	static async fetchAllItems(
		offset: number,
		limit: number
	): Promise<{ items: Item[]; total: number }> {
		const key = `items-list-${offset}-${limit}`;
		const cached = get<{ items: Item[]; total: number }>(key);
		if (cached) return cached;

		const list = await fetchJSON<{ count: number; results: { name: string; url: string }[] }>(
			`${API_BASE}/item?limit=${limit}&offset=${offset}`
		);
		const items = await batchFetch<Item>(
			list.results.map((r) => r.url),
			(url) => {
				const name = url.split('/').filter(Boolean).pop()!;
				return `item-${name}`;
			},
			TTL.item
		);
		const result = { items, total: list.count };
		return set(key, result, TTL.list);
	}
}
