import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TcgService } from './tcg-service';

function cards(count: number, prefix: string) {
	return Array.from({ length: count }, (_, i) => ({
		id: `${prefix}-${i}`,
		localId: String(i),
		name: `${prefix} ${i}`
	}));
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
	fetchMock = vi.fn();
	vi.stubGlobal('fetch', fetchMock);
});
afterEach(() => vi.unstubAllGlobals());

function respondWith(handler: (url: URL) => unknown[]) {
	fetchMock.mockImplementation(async (input: string | URL) => {
		const url = new URL(String(input));
		return new Response(JSON.stringify(handler(url)), { status: 200 });
	});
}

describe('TcgService.searchCards', () => {
	it('reports no next page when the page is not full, without another request', async () => {
		respondWith(() => cards(5, 'few'));
		const result = await TcgService.searchCards({ name: 'few-case' });
		expect(result.hasMore).toBe(false);
		expect(result.cards).toHaveLength(5);
		expect(fetchMock).toHaveBeenCalledTimes(1);
	});

	it('reports a next page when the following page has cards', async () => {
		respondWith((url) =>
			url.searchParams.get('pagination:page') === '1' ? cards(24, 'p1') : cards(3, 'p2')
		);
		const result = await TcgService.searchCards({ name: 'more-case' });
		expect(result.hasMore).toBe(true);
	});

	it('reports no next page when a full page is the last one', async () => {
		respondWith((url) => (url.searchParams.get('pagination:page') === '1' ? cards(24, 'x') : []));
		const result = await TcgService.searchCards({ name: 'exact-case' });
		expect(result.cards).toHaveLength(24);
		expect(result.hasMore).toBe(false);
	});

	it('serves the next page from the cache after it was probed', async () => {
		respondWith((url) =>
			url.searchParams.get('pagination:page') === '1' ? cards(24, 'c1') : cards(2, 'c2')
		);
		await TcgService.searchCards({ name: 'cache-case', page: 1 });
		fetchMock.mockClear();
		const second = await TcgService.searchCards({ name: 'cache-case', page: 2 });
		expect(second.cards).toHaveLength(2);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it('still returns the page when probing the next one fails', async () => {
		let calls = 0;
		fetchMock.mockImplementation(async () => {
			calls++;
			if (calls === 1) return new Response(JSON.stringify(cards(24, 'ok')), { status: 200 });
			return new Response('{}', { status: 404 });
		});
		const result = await TcgService.searchCards({ name: 'probe-fail-case' });
		expect(result.cards).toHaveLength(24);
		expect(result.hasMore).toBe(false);
	});
});
