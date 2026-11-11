import { beforeEach, describe, expect, it } from 'vitest';
import { deckStore } from './decks.svelte';

const pikachu = {
	id: 'a-1',
	name: 'Pikachu',
	localId: '1',
	setId: 'a',
	category: 'Pokemon' as const,
	basicPokemon: true,
	basicEnergy: false,
	legal: { standard: true, expanded: true }
};

beforeEach(() => {
	localStorage.clear();
	deckStore.decks = {};
	deckStore.loaded = false;
});

describe('deckStore', () => {
	it('creates, renames and persists a deck', () => {
		const deck = deckStore.create('Lightning');
		deckStore.rename(deck.id, '  Thunder  ');
		deckStore.decks = {};
		deckStore.load();
		expect(deckStore.get(deck.id)?.name).toBe('Thunder');
	});

	it('adds and removes cards and sets the format', () => {
		const deck = deckStore.create('D');
		deckStore.adjust(deck.id, pikachu, 3);
		deckStore.adjust(deck.id, pikachu, -1);
		deckStore.setFormat(deck.id, 'expanded');
		expect(deckStore.get(deck.id)?.cards['a-1'].count).toBe(2);
		expect(deckStore.get(deck.id)?.format).toBe('expanded');
	});

	it('lists the most recently changed deck first', async () => {
		const first = deckStore.create('First');
		await new Promise((r) => setTimeout(r, 5));
		const second = deckStore.create('Second');
		await new Promise((r) => setTimeout(r, 5));
		deckStore.rename(first.id, 'First again');
		expect(deckStore.list.map((d) => d.id)).toEqual([first.id, second.id]);
	});

	it('deletes a deck', () => {
		const deck = deckStore.create('Gone');
		deckStore.remove(deck.id);
		expect(deckStore.get(deck.id)).toBeUndefined();
		expect(JSON.parse(localStorage.getItem('tcg-decks')!).decks).toEqual({});
	});

	it('ignores changes to a deck that does not exist', () => {
		deckStore.adjust('missing', pikachu, 1);
		expect(deckStore.decks).toEqual({});
	});

	it('survives corrupt storage', () => {
		localStorage.setItem('tcg-decks', 'not json');
		deckStore.load();
		expect(deckStore.decks).toEqual({});
		expect(deckStore.loaded).toBe(true);
	});
});
