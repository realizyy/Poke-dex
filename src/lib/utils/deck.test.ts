import { describe, expect, it } from 'vitest';
import {
	adjustCardCount,
	atCopyLimit,
	categoryCounts,
	createDeck,
	deckSize,
	decklistText,
	describeProblem,
	parseDecks,
	serializeDecks,
	setCardCount,
	toDeckCard,
	validateDeck,
	type Deck,
	type DeckCard
} from './deck';
import type { TcgCard } from '#lib/types';

type Printing = Omit<DeckCard, 'count'>;

function printing(overrides: Partial<Printing> & { id: string; name: string }): Printing {
	return {
		localId: '1',
		setId: 'set',
		category: 'Pokemon',
		basicPokemon: false,
		basicEnergy: false,
		legal: { standard: true, expanded: true },
		...overrides
	};
}

const pikachu = printing({ id: 'a-1', name: 'Pikachu', basicPokemon: true });
const pikachuOther = printing({ id: 'b-9', name: 'Pikachu', basicPokemon: true });
const boss = printing({ id: 'a-2', name: "Boss's Orders", category: 'Trainer' });
const grass = printing({ id: 'e-1', name: 'Grass Energy', category: 'Energy', basicEnergy: true });

function filled(extra: Printing[] = [], counts: Record<string, number> = {}): Deck {
	let deck = createDeck('Test', 'd1', 1);
	deck = setCardCount(deck, pikachu, counts.pikachu ?? 4);
	deck = setCardCount(deck, boss, counts.boss ?? 4);
	deck = setCardCount(deck, grass, counts.grass ?? 52);
	for (const card of extra) deck = setCardCount(deck, card, 1);
	return deck;
}

describe('building a deck', () => {
	it('names an empty title and starts as an empty Standard deck', () => {
		const deck = createDeck('   ', 'x', 5);
		expect(deck).toMatchObject({
			name: 'Untitled deck',
			format: 'standard',
			cards: {},
			updatedAt: 5
		});
	});

	it('adjusts counts and removes a card at zero without mutating the old deck', () => {
		const before = createDeck('a', 'x');
		const added = adjustCardCount(before, pikachu, 2);
		expect(added.cards['a-1'].count).toBe(2);
		expect(before.cards).toEqual({});
		expect(adjustCardCount(added, pikachu, -5).cards).toEqual({});
	});

	it('totals the cards across printings', () => {
		expect(deckSize(filled())).toBe(60);
	});

	it('knows when a name is at the copy limit across printings, except Basic Energy', () => {
		let deck = setCardCount(createDeck('a', 'x'), pikachu, 3);
		expect(atCopyLimit(deck, pikachu)).toBe(false);
		deck = setCardCount(deck, pikachuOther, 1);
		expect(atCopyLimit(deck, pikachu)).toBe(true);
		deck = setCardCount(deck, grass, 40);
		expect(atCopyLimit(deck, grass)).toBe(false);
	});
});

describe('validateDeck', () => {
	it('accepts a legal 60 card deck', () => {
		expect(validateDeck(filled())).toEqual({ valid: true, size: 60, problems: [] });
	});

	it('reports a short or long deck with its size', () => {
		expect(validateDeck(filled([], { grass: 40 })).problems).toContainEqual({
			code: 'size',
			size: 48
		});
		expect(validateDeck(filled([], { grass: 60 })).problems).toContainEqual({
			code: 'size',
			size: 68
		});
	});

	it('counts copies by name across printings and ignores Basic Energy', () => {
		const deck = setCardCount(filled([], { pikachu: 3 }), pikachuOther, 2);
		const copies = validateDeck(deck).problems.find((p) => p.code === 'copies');
		expect(copies).toEqual({ code: 'copies', names: ['Pikachu'] });
		expect(validateDeck(filled()).problems.some((p) => p.code === 'copies')).toBe(false);
	});

	it('requires a Basic Pokémon once the deck has any card', () => {
		expect(validateDeck(createDeck('e', 'x')).problems.map((p) => p.code)).toEqual(['size']);
		const noBasic = setCardCount(createDeck('n', 'x'), boss, 4);
		expect(validateDeck(noBasic).problems.map((p) => p.code)).toContain('no-basic-pokemon');
	});

	it('checks legality against the chosen format only', () => {
		const old = printing({
			id: 'o-1',
			name: 'Old Card',
			legal: { standard: false, expanded: true }
		});
		const base = filled([old], { grass: 51 });
		expect(validateDeck({ ...base, format: 'standard' }).problems).toContainEqual({
			code: 'illegal',
			names: ['Old Card'],
			format: 'standard'
		});
		expect(validateDeck({ ...base, format: 'expanded' }).valid).toBe(true);
		expect(validateDeck({ ...base, format: 'unlimited' }).valid).toBe(true);
	});
});

describe('describeProblem', () => {
	it('tells the player what to do about the deck size', () => {
		expect(describeProblem({ code: 'size', size: 59 })).toBe(
			'Add 1 more card (a deck has exactly 60).'
		);
		expect(describeProblem({ code: 'size', size: 62 })).toBe(
			'Remove 2 cards (a deck has exactly 60).'
		);
	});
});

describe('toDeckCard', () => {
	const card = {
		id: 'swsh3-136',
		localId: '136',
		name: 'Furret',
		category: 'Pokemon',
		stage: 'Stage1',
		set: { id: 'swsh3' },
		legal: { standard: false, expanded: true }
	} as unknown as TcgCard;

	it('derives Basic flags from the card data', () => {
		expect(toDeckCard(card)).toMatchObject({
			basicPokemon: false,
			basicEnergy: false,
			setId: 'swsh3'
		});
		expect(toDeckCard({ ...card, stage: 'Basic' } as TcgCard).basicPokemon).toBe(true);
		const energy = { ...card, category: 'Energy', energyType: 'Normal' } as unknown as TcgCard;
		expect(toDeckCard(energy)).toMatchObject({ basicEnergy: true, basicPokemon: false });
		const special = { ...card, category: 'Energy', energyType: 'Special' } as unknown as TcgCard;
		expect(toDeckCard(special).basicEnergy).toBe(false);
	});

	it('treats missing legality as not legal', () => {
		expect(toDeckCard({ ...card, legal: undefined } as TcgCard).legal).toEqual({
			standard: false,
			expanded: false
		});
	});
});

describe('summaries and storage', () => {
	it('counts cards per category', () => {
		expect(categoryCounts(filled())).toEqual({ Pokemon: 4, Trainer: 4, Energy: 52 });
	});

	it('writes a readable decklist grouped by category', () => {
		const text = decklistText(filled());
		expect(text).toContain('Pokémon: 4');
		expect(text).toContain('4 Pikachu set-1');
		expect(text).toContain('Energy: 52');
		expect(text.endsWith('Total cards: 60')).toBe(true);
	});

	it('round trips decks and drops malformed data', () => {
		const deck = filled();
		expect(parseDecks(JSON.parse(serializeDecks({ d1: deck })))).toEqual({ d1: deck });
		const parsed = parseDecks({
			decks: {
				ok: { ...deck, format: 'nonsense' },
				bad: { name: 'no id' },
				mixed: { ...deck, id: 'mixed', cards: { ...deck.cards, junk: { id: 1 } } }
			}
		});
		expect(Object.keys(parsed).sort()).toEqual(['d1', 'mixed']);
		expect(parsed.d1.format).toBe('standard');
		expect(Object.keys(parsed.mixed.cards)).toHaveLength(3);
		expect(parseDecks(null)).toEqual({});
	});
});
