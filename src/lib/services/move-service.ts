import { TtlCache } from '#lib/api/ttl-cache';
import { fetchJson, batchFetch as sharedBatchFetch } from '#lib/api/http';
import type { Move, Ability, Nature, Machine } from '#lib/types';

const API_BASE = 'https://pokeapi.co/api/v2';
const cache = new TtlCache(300);

const TTL = {
	move: 20 * 60 * 1000,
	ability: 20 * 60 * 1000,
	nature: 60 * 60 * 1000,
	machine: 30 * 60 * 1000
};

const get = <T>(key: string): T | null => cache.get<T>(key) ?? null;
const set = <T>(key: string, data: T, ttl: number): T => cache.set(key, data, ttl);
const batchFetch = <T>(urls: string[], cacheKeyFn: (url: string) => string, ttl: number) =>
	sharedBatchFetch<T>(cache, urls, cacheKeyFn, ttl);

export class MoveService {
	static async fetchMove(nameOrId: string | number): Promise<Move> {
		const key = `move-${nameOrId}`;
		const cached = get<Move>(key);
		if (cached) return cached;
		const data = await fetchJson<Move>(`${API_BASE}/move/${nameOrId}`);
		return set(key, data, TTL.move);
	}
}

// ─── Ability Service ──────────────────────────────────────────────────────────

export class AbilityService {
	static async fetchAbility(nameOrId: string | number): Promise<Ability> {
		const key = `ability-${nameOrId}`;
		const cached = get<Ability>(key);
		if (cached) return cached;
		const data = await fetchJson<Ability>(`${API_BASE}/ability/${nameOrId}`);
		return set(key, data, TTL.ability);
	}
}

// ─── Nature Service ───────────────────────────────────────────────────────────

export class NatureService {
	static async fetchAllNatures(): Promise<Nature[]> {
		const key = 'all-natures';
		const cached = get<Nature[]>(key);
		if (cached) return cached;

		const list = await fetchJson<{ results: { url: string }[] }>(`${API_BASE}/nature?limit=25`);
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
		const data = await fetchJson<{ count: number; results: { url: string }[] }>(
			`${API_BASE}/machine?offset=${offset}&limit=${limit}`
		);
		return set(key, data, TTL.machine);
	}

	static async fetchMachine(id: number): Promise<Machine> {
		const key = `machine-${id}`;
		const cached = get<Machine>(key);
		if (cached) return cached;
		const data = await fetchJson<Machine>(`${API_BASE}/machine/${id}`);
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
