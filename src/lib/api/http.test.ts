import { describe, expect, it, vi } from 'vitest';
import { fetchJson, HttpError, mapWithConcurrency } from './http';

function jsonResponse(body: unknown, status = 200): Response {
	return new Response(JSON.stringify(body), { status });
}

describe('fetchJson', () => {
	it('returns parsed json on success', async () => {
		const fetcher = vi.fn().mockResolvedValue(jsonResponse({ id: 25 }));
		await expect(fetchJson('https://x/pokemon/25', { fetcher })).resolves.toEqual({ id: 25 });
	});

	it('throws an HttpError without retrying on 404', async () => {
		const fetcher = vi.fn().mockResolvedValue(jsonResponse({}, 404));
		await expect(fetchJson('https://x/nope', { fetcher, backoffMs: 0 })).rejects.toMatchObject({
			status: 404
		});
		expect(fetcher).toHaveBeenCalledTimes(1);
	});

	it('retries a 503 and then succeeds', async () => {
		const fetcher = vi
			.fn()
			.mockResolvedValueOnce(jsonResponse({}, 503))
			.mockResolvedValueOnce(jsonResponse({ ok: true }));
		await expect(fetchJson('https://x/a', { fetcher, backoffMs: 0 })).resolves.toEqual({
			ok: true
		});
		expect(fetcher).toHaveBeenCalledTimes(2);
	});

	it('retries network errors and rethrows the last one', async () => {
		const fetcher = vi.fn().mockRejectedValue(new TypeError('network down'));
		await expect(fetchJson('https://x/a', { fetcher, backoffMs: 0, retries: 3 })).rejects.toThrow(
			'network down'
		);
		expect(fetcher).toHaveBeenCalledTimes(3);
	});

	it('gives up on a persistent 500 with an HttpError', async () => {
		const fetcher = vi.fn().mockResolvedValue(jsonResponse({}, 500));
		const error = await fetchJson('https://x/a', { fetcher, backoffMs: 0 }).catch((e) => e);
		expect(error).toBeInstanceOf(HttpError);
		expect(fetcher).toHaveBeenCalledTimes(3);
	});
});

describe('mapWithConcurrency', () => {
	it('keeps result order and never exceeds the limit', async () => {
		let active = 0;
		let peak = 0;
		const results = await mapWithConcurrency([1, 2, 3, 4, 5, 6], 2, async (n) => {
			active++;
			peak = Math.max(peak, active);
			await new Promise((r) => setTimeout(r, 5));
			active--;
			return n * 10;
		});
		expect(results).toEqual([10, 20, 30, 40, 50, 60]);
		expect(peak).toBe(2);
	});
});
