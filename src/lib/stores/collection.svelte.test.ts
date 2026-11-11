import { beforeEach, describe, expect, it } from 'vitest';
import { collectionStore } from './collection.svelte';

const furret = { id: 'swsh3-136', setId: 'swsh3', name: 'Furret' };

beforeEach(() => {
	localStorage.clear();
	collectionStore.entries = {};
	collectionStore.loaded = false;
});

describe('collectionStore', () => {
	it('persists changes and reloads them', () => {
		collectionStore.setOwned(furret, 2);
		collectionStore.toggleWishlist(furret);
		collectionStore.entries = {};
		collectionStore.load();
		expect(collectionStore.get('swsh3-136')).toMatchObject({ owned: 2, wishlisted: true });
	});

	it('adjusts quantity up and down and never below zero', () => {
		collectionStore.adjustOwned(furret, 1);
		collectionStore.adjustOwned(furret, 1);
		collectionStore.adjustOwned(furret, -1);
		expect(collectionStore.get('swsh3-136')?.owned).toBe(1);
		collectionStore.adjustOwned(furret, -5);
		expect(collectionStore.get('swsh3-136')).toBeUndefined();
	});

	it('survives corrupt storage', () => {
		localStorage.setItem('tcg-collection', '{not json');
		collectionStore.load();
		expect(collectionStore.entries).toEqual({});
		expect(collectionStore.loaded).toBe(true);
	});

	it('exports and imports a collection', () => {
		collectionStore.setOwned(furret, 3);
		const text = collectionStore.exportJson();
		collectionStore.entries = {};
		expect(collectionStore.importJson(text)).toBe(1);
		expect(collectionStore.get('swsh3-136')?.owned).toBe(3);
	});

	it('rejects an import that is not JSON without touching the collection', () => {
		collectionStore.setOwned(furret, 1);
		expect(() => collectionStore.importJson('nope')).toThrow();
		expect(collectionStore.get('swsh3-136')?.owned).toBe(1);
	});
});
