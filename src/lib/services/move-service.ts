import type { Move, Ability, Nature, Machine } from '$lib/types';

const API_BASE = 'https://pokeapi.co/api/v2';
const CACHE = new Map<string, unknown>();
const CACHE_META = new Map<string, { expiry: number }>();

const TTL = {
	move: 20 * 60 * 1000,
	ability: 20 * 60 * 1000,
	nature: 60 * 60 * 1000,
	machine: 30 * 60 * 1000
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

// ─── Move Service ─────────────────────────────────────────────────────────────

export class MoveService {
	static async fetchMove(nameOrId: string | number): Promise<Move> {
		const key = `move-${nameOrId}`;
		const cached = get<Move>(key);
		if (cached) return cached;
		const data = await fetchJSON<Move>(`${API_BASE}/move/${nameOrId}`);
		return set(key, data, TTL.move);
	}
}

// ─── Ability Service ──────────────────────────────────────────────────────────

export class AbilityService {
	static async fetchAbility(nameOrId: string | number): Promise<Ability> {
		const key = `ability-${nameOrId}`;
		const cached = get<Ability>(key);
		if (cached) return cached;
		const data = await fetchJSON<Ability>(`${API_BASE}/ability/${nameOrId}`);
		return set(key, data, TTL.ability);
	}
}

// ─── Nature Service ───────────────────────────────────────────────────────────

export class NatureService {
	static async fetchAllNatures(): Promise<Nature[]> {
		const key = 'all-natures';
		const cached = get<Nature[]>(key);
		if (cached) return cached;

		const list = await fetchJSON<{ results: { url: string }[] }>(
			`${API_BASE}/nature?limit=25`
		);
		const natures = await batchFetch<Nature>(
			list.results.map((r) => r.url),
			(url) => {
				const id = url.split('/').filter(Boolean).pop()!;
				return `nature-${id}`;
			},
			TTL.nature
		);
		// Sort alphabetically for the table
		natures.sort((a, b) => a.name.localeCompare(b.name));
		return set(key, natures, TTL.nature);
	}
}

// ─── Machine Service ──────────────────────────────────────────────────────────────────

export class MachineService {
	static async fetchMachineList(
		offset: number,
		limit: number
	): Promise<{ count: number; results: { url: string }[] }> {
		const key = `machine-list-${offset}-${limit}`;
		const cached = get<{ count: number; results: { url: string }[] }>(key);
		if (cached) return cached;
		const data = await fetchJSON<{ count: number; results: { url: string }[] }>(
			`${API_BASE}/machine?offset=${offset}&limit=${limit}`
		);
		return set(key, data, TTL.machine);
	}

	static async fetchMachine(id: number): Promise<Machine> {
		const key = `machine-${id}`;
		const cached = get<Machine>(key);
		if (cached) return cached;
		const data = await fetchJSON<Machine>(`${API_BASE}/machine/${id}`);
		return set(key, data, TTL.machine);
	}

	static async fetchMachineBatch(offset: number, limit: number): Promise<Machine[]> {
		const list = await this.fetchMachineList(offset, limit);
		return batchFetch<Machine>(
			list.results.map((r) => r.url),
			(url) => {
				const id = url.split('/').filter(Boolean).pop()!;
				return `machine-${id}`;
			},
			TTL.machine
		);
	}
}
