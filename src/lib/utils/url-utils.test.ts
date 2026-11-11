import { describe, expect, it } from 'vitest';
import { URLUtils } from './url-utils';

describe('URLUtils search parsing', () => {
	it('reads types, generations, query and offset from the URL', () => {
		const params = new URLSearchParams('q=pika&types=electric,fire&generations=1,2&offset=50');
		expect(URLUtils.parseSearchQueryFromUrl(params)).toBe('pika');
		expect(URLUtils.parseSearchFiltersFromUrl(params)).toMatchObject({
			types: ['electric', 'fire'],
			generations: ['1', '2']
		});
		expect(URLUtils.parseOffsetFromUrl(params)).toBe(50);
	});

	it('returns neutral defaults for an empty URL', () => {
		const params = new URLSearchParams('');
		expect(URLUtils.parseSearchQueryFromUrl(params)).toBe('');
		expect(URLUtils.parseSearchFiltersFromUrl(params).types).toEqual([]);
		expect(URLUtils.parseOffsetFromUrl(params)).toBe(0);
	});
});
