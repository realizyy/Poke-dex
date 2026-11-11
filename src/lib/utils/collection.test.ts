import { describe, expect, it } from 'vitest';
import {
	parseCollection,
	serializeCollection,
	setOwned,
	setProgress,
	summarize,
	toggleWishlist,
	type CardRef,
	type Collection
} from './collection';

const furret: CardRef = { id: 'swsh3-136', setId: 'swsh3', name: 'Furret', image: 'https://img/f' };
const pikachu: CardRef = { id: 'swsh3-62', setId: 'swsh3', name: 'Pikachu' };
const charizard: CardRef = { id: 'base1-4', setId: 'base1', name: 'Charizard' };

describe('setOwned', () => {
	it('adds a card with its quantity and details', () => {
		const next = setOwned({}, furret, 2, 1000);
		expect(next['swsh3-136']).toMatchObject({
			owned: 2,
			wishlisted: false,
			setId: 'swsh3',
			addedAt: 1000
		});
	});

	it('does not mutate the previous collection', () => {
		const before: Collection = {};
		setOwned(before, furret, 1);
		expect(before).toEqual({});
	});

	it('removes the entry when the quantity drops to zero and it is not wishlisted', () => {
		const owned = setOwned({}, furret, 1);
		expect(setOwned(owned, furret, 0)).toEqual({});
	});

	it('keeps a wishlisted entry at zero copies', () => {
		const wished = toggleWishlist(setOwned({}, furret, 1), furret);
		expect(setOwned(wished, furret, 0)['swsh3-136']).toMatchObject({ owned: 0, wishlisted: true });
	});

	it('clamps negative, fractional and huge quantities', () => {
		expect(setOwned({}, furret, -3)).toEqual({});
		expect(setOwned({}, furret, 2.9)['swsh3-136'].owned).toBe(2);
		expect(setOwned({}, furret, 5000)['swsh3-136'].owned).toBe(999);
	});

	it('keeps the original addedAt when the quantity changes', () => {
		const first = setOwned({}, furret, 1, 1000);
		expect(setOwned(first, furret, 3, 9999)['swsh3-136'].addedAt).toBe(1000);
	});
});

describe('toggleWishlist', () => {
	it('adds then removes a card that is not owned', () => {
		const wished = toggleWishlist({}, pikachu);
		expect(wished['swsh3-62'].wishlisted).toBe(true);
		expect(toggleWishlist(wished, pikachu)).toEqual({});
	});

	it('does not drop a card that is also owned', () => {
		const both = toggleWishlist(setOwned({}, pikachu, 1), pikachu);
		expect(toggleWishlist(both, pikachu)['swsh3-62']).toMatchObject({
			owned: 1,
			wishlisted: false
		});
	});
});

describe('setProgress and summarize', () => {
	const collection = setOwned(
		setOwned(toggleWishlist(setOwned({}, furret, 2), pikachu), charizard, 1),
		pikachu,
		0
	);

	it('counts unique owned cards in a set against its total', () => {
		expect(setProgress(collection, 'swsh3', 200)).toEqual({
			owned: 1,
			wishlisted: 1,
			total: 200,
			percent: 1
		});
	});

	it('handles an empty set total without dividing by zero', () => {
		expect(setProgress(collection, 'swsh3', 0).percent).toBe(0);
	});

	it('summarizes copies, unique cards, wishlist and sets', () => {
		expect(summarize(collection)).toEqual({
			uniqueCards: 2,
			totalCopies: 3,
			wishlisted: 1,
			sets: 2
		});
	});
});

describe('parseCollection and serializeCollection', () => {
	it('round trips a collection', () => {
		const collection = setOwned({}, furret, 3, 5);
		expect(parseCollection(JSON.parse(serializeCollection(collection)))).toEqual(collection);
	});

	it('returns an empty collection for garbage', () => {
		expect(parseCollection(null)).toEqual({});
		expect(parseCollection('x')).toEqual({});
		expect(parseCollection({ entries: 7 })).toEqual({});
	});

	it('drops malformed and empty entries but keeps good ones', () => {
		const good = setOwned({}, furret, 1, 5)['swsh3-136'];
		const parsed = parseCollection({
			entries: {
				a: good,
				b: { id: 'x' },
				c: { ...good, id: 'c', owned: 0, wishlisted: false },
				d: { ...good, id: 'd', owned: -2 }
			}
		});
		expect(Object.keys(parsed)).toEqual(['swsh3-136']);
	});
});
