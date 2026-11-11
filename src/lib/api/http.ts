import type { TtlCache } from './ttl-cache';

export class HttpError extends Error {
	readonly status: number;
	readonly url: string;

	constructor(status: number, url: string) {
		super(`HTTP ${status}: ${url}`);
		this.name = 'HttpError';
		this.status = status;
		this.url = url;
	}
}

export interface FetchJsonOptions {
	retries?: number;
	timeoutMs?: number;
	backoffMs?: number;
	fetcher?: typeof fetch;
}

function isRetryable(status: number): boolean {
	return status === 429 || status >= 500;
}

export async function fetchJson<T>(url: string, options: FetchJsonOptions = {}): Promise<T> {
	const { retries = 3, timeoutMs = 20000, backoffMs = 600, fetcher = fetch } = options;
	let lastError: unknown;

	for (let attempt = 1; attempt <= retries; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const response = await fetcher(url, { signal: controller.signal });
			if (response.ok) return (await response.json()) as T;
			lastError = new HttpError(response.status, url);
			if (!isRetryable(response.status)) throw lastError;
		} catch (error) {
			if (error instanceof HttpError && !isRetryable(error.status)) throw error;
			lastError = error;
		} finally {
			clearTimeout(timer);
		}
		if (attempt < retries) await new Promise((r) => setTimeout(r, attempt * backoffMs));
	}
	throw lastError;
}

export async function mapWithConcurrency<T, R>(
	items: readonly T[],
	limit: number,
	fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
	const results = new Array<R>(items.length);
	let next = 0;
	const workers = Array.from({ length: Math.min(limit, items.length) }, async () => {
		while (next < items.length) {
			const index = next++;
			results[index] = await fn(items[index], index);
		}
	});
	await Promise.all(workers);
	return results;
}

export async function batchFetch<T>(
	cache: TtlCache,
	urls: string[],
	cacheKeyFn: (url: string) => string,
	ttlMs: number,
	concurrency = 10
): Promise<T[]> {
	return mapWithConcurrency(urls, concurrency, (url) =>
		cache.getOrLoad<T>(cacheKeyFn(url), ttlMs, () => fetchJson<T>(url))
	);
}
