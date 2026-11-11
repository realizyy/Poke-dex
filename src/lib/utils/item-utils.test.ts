import { describe, expect, it } from 'vitest';
import { getItemCost, isItem } from './item-utils';

describe('getItemCost', () => {
	it('uses the legacy cost field when the API still sends it', () => {
		expect(getItemCost({ cost: 200, prices: [] })).toBe(200);
	});

	it('reads the first purchase price from prices', () => {
		const prices = [
			{ purchase_price: null, sell_price: 0 },
			{ purchase_price: 300, sell_price: 150 }
		];
		expect(getItemCost({ prices })).toBe(300);
	});

	it('treats an item with prices but no purchase price as not for sale', () => {
		expect(getItemCost({ prices: [{ purchase_price: null, sell_price: 0 }] })).toBe(0);
	});

	it('returns null when the API gives no price information', () => {
		expect(getItemCost({})).toBeNull();
	});
});

describe('isItem', () => {
	it('accepts a real item payload', () => {
		expect(isItem({ id: 1, name: 'master-ball', category: { name: 'standard-balls' } })).toBe(true);
	});

	it('rejects the empty status payload PokeAPI returned for item 37', () => {
		expect(isItem({ status: 200, message: 'OK' })).toBe(false);
		expect(isItem(null)).toBe(false);
	});
});
