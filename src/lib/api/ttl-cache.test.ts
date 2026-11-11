import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TtlCache } from './ttl-cache';

describe('TtlCache', () => {
	beforeEach(() => vi.useFakeTimers());
	afterEach(() => vi.useRealTimers());

	it('returns a value before its ttl and drops it after', () => {
		const cache = new TtlCache();
		cache.set('a', 1, 1000);
		expect(cache.get('a')).toBe(1);
		vi.advanceTimersByTime(1000);
		expect(cache.get('a')).toBeUndefined();
		expect(cache.size).toBe(0);
	});

	it('evicts the least recently used entry past maxEntries', () => {
		const cache = new TtlCache(2);
		cache.set('a', 1, 1000);
		cache.set('b', 2, 1000);
		cache.get('a');
		cache.set('c', 3, 1000);
		expect(cache.has('a')).toBe(true);
		expect(cache.has('b')).toBe(false);
		expect(cache.has('c')).toBe(true);
	});

	it('shares one in-flight load between concurrent callers', async () => {
		const cache = new TtlCache();
		const loader = vi.fn().mockResolvedValue('value');
		const [x, y] = await Promise.all([
			cache.getOrLoad('k', 1000, loader),
			cache.getOrLoad('k', 1000, loader)
		]);
		expect([x, y]).toEqual(['value', 'value']);
		expect(loader).toHaveBeenCalledTimes(1);
		await cache.getOrLoad('k', 1000, loader);
		expect(loader).toHaveBeenCalledTimes(1);
	});

	it('does not cache a failed load', async () => {
		const cache = new TtlCache();
		const loader = vi.fn().mockRejectedValueOnce(new Error('boom')).mockResolvedValueOnce('ok');
		await expect(cache.getOrLoad('k', 1000, loader)).rejects.toThrow('boom');
		await expect(cache.getOrLoad('k', 1000, loader)).resolves.toBe('ok');
	});

	it('reports a hit rate and prunes expired entries', () => {
		const cache = new TtlCache();
		cache.set('a', 1, 1000);
		cache.get('a');
		cache.get('missing');
		expect(cache.hitRate).toBe(0.5);
		vi.advanceTimersByTime(1000);
		expect(cache.prune()).toBe(1);
	});
});
