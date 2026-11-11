import { describe, expect, it } from 'vitest';
import { buildCardSearchParams, formatPrice, getCardPrices } from './tcg';

describe('buildCardSearchParams', () => {
	it('always sends pagination with defaults', () => {
		const params = buildCardSearchParams({});
		expect(params.get('pagination:page')).toBe('1');
		expect(params.get('pagination:itemsPerPage')).toBe('24');
	});

	it('sends both ends of an HP range as separate hp params', () => {
		const params = buildCardSearchParams({ hpMin: 60, hpMax: 120 });
		expect(params.getAll('hp')).toEqual(['gte:60', 'lte:120']);
	});

	it('sends only the bound that is set', () => {
		expect(buildCardSearchParams({ hpMax: 90 }).getAll('hp')).toEqual(['lte:90']);
		expect(buildCardSearchParams({ hpMin: 0 }).getAll('hp')).toEqual(['gte:0']);
	});

	it('maps category, stage, set and sort to the API names', () => {
		const params = buildCardSearchParams({
			category: 'Trainer',
			stage: 'Basic',
			setId: 'swsh3',
			sortField: 'hp',
			sortOrder: 'DESC'
		});
		expect(params.get('category')).toBe('Trainer');
		expect(params.get('stage')).toBe('Basic');
		expect(params.get('set.id')).toBe('eq:swsh3');
		expect(params.get('sort:field')).toBe('hp');
		expect(params.get('sort:order')).toBe('DESC');
	});

	it('leaves sort out unless a field is chosen', () => {
		const params = buildCardSearchParams({ sortOrder: 'DESC' });
		expect(params.has('sort:field')).toBe(false);
		expect(params.has('sort:order')).toBe(false);
	});
});

describe('getCardPrices', () => {
	it('returns nothing for a card without pricing', () => {
		expect(getCardPrices(undefined)).toEqual([]);
		expect(getCardPrices({})).toEqual([]);
	});

	it('reads Cardmarket fields and skips null ones', () => {
		const rows = getCardPrices({
			cardmarket: { unit: 'EUR', avg: 0.06, low: 0.02, trend: null, 'trend-holo': 0.29 }
		});
		expect(rows.map((r) => [r.label, r.amount])).toEqual([
			['Average', 0.06],
			['Lowest', 0.02],
			['Holo trend', 0.29]
		]);
		expect(rows.every((r) => r.currency === 'EUR' && r.source === 'Cardmarket')).toBe(true);
	});

	it('reads the market price of every TCGplayer finish and ignores metadata', () => {
		const rows = getCardPrices({
			tcgplayer: {
				unit: 'USD',
				updated: '2026-11-11T00:00:00Z',
				normal: { marketPrice: 0.28 },
				'reverse-holofoil': { marketPrice: 0.43, lowPrice: 0.17 },
				holofoil: { marketPrice: null }
			}
		});
		expect(rows.map((r) => [r.label, r.amount, r.currency])).toEqual([
			['Normal market', 0.28, 'USD'],
			['Reverse holofoil market', 0.43, 'USD']
		]);
	});
});

describe('formatPrice', () => {
	it('formats in the given currency', () => {
		expect(formatPrice(1234.5, 'USD')).toBe('$1,234.50');
		expect(formatPrice(0.06, 'EUR')).toBe('€0.06');
	});

	it('falls back for an invalid currency code', () => {
		expect(formatPrice(2, 'not-a-currency')).toBe('2.00 not-a-currency');
	});
});
