interface Entry {
	value: unknown;
	expiry: number;
}

export class TtlCache {
	#entries = new Map<string, Entry>();
	#inflight = new Map<string, Promise<unknown>>();
	#hits = 0;
	#misses = 0;
	readonly maxEntries: number;

	constructor(maxEntries = 500) {
		this.maxEntries = maxEntries;
	}

	get size(): number {
		return this.#entries.size;
	}

	get hitRate(): number {
		const total = this.#hits + this.#misses;
		return total === 0 ? 0 : this.#hits / total;
	}

	get<T>(key: string): T | undefined {
		const entry = this.#entries.get(key);
		if (!entry) {
			this.#misses++;
			return undefined;
		}
		if (Date.now() >= entry.expiry) {
			this.#entries.delete(key);
			this.#misses++;
			return undefined;
		}
		this.#entries.delete(key);
		this.#entries.set(key, entry);
		this.#hits++;
		return entry.value as T;
	}

	has(key: string): boolean {
		const entry = this.#entries.get(key);
		return !!entry && Date.now() < entry.expiry;
	}

	set<T>(key: string, value: T, ttlMs: number): T {
		this.#entries.delete(key);
		this.#entries.set(key, { value, expiry: Date.now() + ttlMs });
		while (this.#entries.size > this.maxEntries) {
			const oldest = this.#entries.keys().next().value;
			if (oldest === undefined) break;
			this.#entries.delete(oldest);
		}
		return value;
	}

	async getOrLoad<T>(key: string, ttlMs: number, loader: () => Promise<T>): Promise<T> {
		const cached = this.get<T>(key);
		if (cached !== undefined) return cached;
		const pending = this.#inflight.get(key) as Promise<T> | undefined;
		if (pending) return pending;
		const promise = loader()
			.then((value) => this.set(key, value, ttlMs))
			.finally(() => this.#inflight.delete(key));
		this.#inflight.set(key, promise);
		return promise;
	}

	prune(): number {
		const now = Date.now();
		let removed = 0;
		for (const [key, entry] of this.#entries) {
			if (now >= entry.expiry) {
				this.#entries.delete(key);
				removed++;
			}
		}
		return removed;
	}

	clear(): void {
		this.#entries.clear();
		this.#inflight.clear();
	}

	approximateBytes(): number {
		let total = 0;
		for (const entry of this.#entries.values()) total += JSON.stringify(entry.value).length;
		return total;
	}
}
