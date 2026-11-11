import type { TcgCard } from '#lib/types';

export type DeckFormat = 'standard' | 'expanded' | 'unlimited';
export type DeckCardCategory = 'Pokemon' | 'Trainer' | 'Energy';

export const DECK_SIZE = 60;
export const MAX_COPIES = 4;
export const DECK_FORMATS: { id: DeckFormat; label: string }[] = [
	{ id: 'standard', label: 'Standard' },
	{ id: 'expanded', label: 'Expanded' },
	{ id: 'unlimited', label: 'Unlimited' }
];

export interface DeckCard {
	id: string;
	name: string;
	localId: string;
	setId: string;
	image?: string;
	category: DeckCardCategory;
	basicPokemon: boolean;
	basicEnergy: boolean;
	legal: { standard: boolean; expanded: boolean };
	count: number;
}

export interface Deck {
	id: string;
	name: string;
	format: DeckFormat;
	cards: Record<string, DeckCard>;
	updatedAt: number;
}

export type DeckProblem =
	| { code: 'size'; size: number }
	| { code: 'copies'; names: string[] }
	| { code: 'no-basic-pokemon' }
	| { code: 'illegal'; names: string[]; format: DeckFormat };

export interface DeckValidation {
	valid: boolean;
	size: number;
	problems: DeckProblem[];
}

export function toDeckCard(card: TcgCard): Omit<DeckCard, 'count'> {
	return {
		id: card.id,
		name: card.name,
		localId: card.localId,
		setId: card.set.id,
		image: card.image,
		category: card.category,
		basicPokemon: card.category === 'Pokemon' && card.stage === 'Basic',
		basicEnergy: card.category === 'Energy' && card.energyType === 'Normal',
		legal: { standard: card.legal?.standard ?? false, expanded: card.legal?.expanded ?? false }
	};
}

export function createDeck(name: string, id: string, now = Date.now()): Deck {
	return {
		id,
		name: name.trim() || 'Untitled deck',
		format: 'standard',
		cards: {},
		updatedAt: now
	};
}

export function deckSize(deck: Deck): number {
	return Object.values(deck.cards).reduce((sum, c) => sum + c.count, 0);
}

export function copiesByName(deck: Deck): Map<string, number> {
	const copies = new Map<string, number>();
	for (const card of Object.values(deck.cards)) {
		if (card.basicEnergy) continue;
		copies.set(card.name, (copies.get(card.name) ?? 0) + card.count);
	}
	return copies;
}

/** Sets the number of copies of one printing. A count of zero or less removes it. */
export function setCardCount(
	deck: Deck,
	card: Omit<DeckCard, 'count'>,
	count: number,
	now = Date.now()
): Deck {
	const next = { ...deck.cards };
	const clamped = Math.max(0, Math.floor(count));
	if (clamped === 0) delete next[card.id];
	else next[card.id] = { ...card, count: clamped };
	return { ...deck, cards: next, updatedAt: now };
}

export function adjustCardCount(
	deck: Deck,
	card: Omit<DeckCard, 'count'>,
	delta: number,
	now = Date.now()
): Deck {
	return setCardCount(deck, card, (deck.cards[card.id]?.count ?? 0) + delta, now);
}

/** True when adding one more copy would break the four copy rule. */
export function atCopyLimit(deck: Deck, card: Pick<DeckCard, 'name' | 'basicEnergy'>): boolean {
	if (card.basicEnergy) return false;
	return (copiesByName(deck).get(card.name) ?? 0) >= MAX_COPIES;
}

export function validateDeck(deck: Deck): DeckValidation {
	const cards = Object.values(deck.cards);
	const size = deckSize(deck);
	const problems: DeckProblem[] = [];

	if (size !== DECK_SIZE) problems.push({ code: 'size', size });

	const overLimit = [...copiesByName(deck)]
		.filter(([, count]) => count > MAX_COPIES)
		.map(([name]) => name)
		.sort();
	if (overLimit.length > 0) problems.push({ code: 'copies', names: overLimit });

	if (cards.length > 0 && !cards.some((c) => c.basicPokemon)) {
		problems.push({ code: 'no-basic-pokemon' });
	}

	if (deck.format !== 'unlimited') {
		const illegal = cards
			.filter((c) => !c.legal[deck.format as 'standard' | 'expanded'])
			.map((c) => c.name);
		if (illegal.length > 0) {
			problems.push({ code: 'illegal', names: [...new Set(illegal)].sort(), format: deck.format });
		}
	}

	return { valid: problems.length === 0, size, problems };
}

export function describeProblem(problem: DeckProblem): string {
	switch (problem.code) {
		case 'size':
			return problem.size < DECK_SIZE
				? `Add ${DECK_SIZE - problem.size} more card${DECK_SIZE - problem.size === 1 ? '' : 's'} (a deck has exactly ${DECK_SIZE}).`
				: `Remove ${problem.size - DECK_SIZE} card${problem.size - DECK_SIZE === 1 ? '' : 's'} (a deck has exactly ${DECK_SIZE}).`;
		case 'copies':
			return `More than ${MAX_COPIES} copies of ${problem.names.join(', ')}.`;
		case 'no-basic-pokemon':
			return 'The deck needs at least one Basic Pokémon.';
		case 'illegal':
			return `Not legal in ${problem.format}: ${problem.names.join(', ')}.`;
	}
}

export function categoryCounts(deck: Deck): Record<DeckCardCategory, number> {
	const counts: Record<DeckCardCategory, number> = { Pokemon: 0, Trainer: 0, Energy: 0 };
	for (const card of Object.values(deck.cards)) counts[card.category] += card.count;
	return counts;
}

export function decklistText(deck: Deck): string {
	const order: DeckCardCategory[] = ['Pokemon', 'Trainer', 'Energy'];
	const lines: string[] = [];
	for (const category of order) {
		const cards = Object.values(deck.cards)
			.filter((c) => c.category === category)
			.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
		if (cards.length === 0) continue;
		const total = cards.reduce((sum, c) => sum + c.count, 0);
		lines.push(`${category === 'Pokemon' ? 'Pokémon' : category}: ${total}`);
		for (const c of cards) lines.push(`${c.count} ${c.name} ${c.setId}-${c.localId}`);
		lines.push('');
	}
	lines.push(`Total cards: ${deckSize(deck)}`);
	return lines.join('\n');
}

function isDeckCard(value: unknown): value is DeckCard {
	const c = value as Partial<DeckCard> | null;
	return (
		!!c &&
		typeof c.id === 'string' &&
		typeof c.name === 'string' &&
		typeof c.localId === 'string' &&
		typeof c.setId === 'string' &&
		(c.category === 'Pokemon' || c.category === 'Trainer' || c.category === 'Energy') &&
		typeof c.basicPokemon === 'boolean' &&
		typeof c.basicEnergy === 'boolean' &&
		typeof c.count === 'number' &&
		c.count > 0 &&
		!!c.legal &&
		typeof c.legal.standard === 'boolean' &&
		typeof c.legal.expanded === 'boolean'
	);
}

export function parseDecks(raw: unknown): Record<string, Deck> {
	const decks = (raw as { decks?: unknown } | null)?.decks;
	if (!decks || typeof decks !== 'object') return {};
	const result: Record<string, Deck> = {};
	for (const value of Object.values(decks)) {
		const d = value as Partial<Deck> | null;
		if (!d || typeof d.id !== 'string' || typeof d.name !== 'string') continue;
		const format = DECK_FORMATS.some((f) => f.id === d.format)
			? (d.format as DeckFormat)
			: 'standard';
		const cards: Record<string, DeckCard> = {};
		for (const card of Object.values(d.cards ?? {})) {
			if (isDeckCard(card)) cards[card.id] = { ...card, count: Math.floor(card.count) };
		}
		result[d.id] = {
			id: d.id,
			name: d.name,
			format,
			cards,
			updatedAt: typeof d.updatedAt === 'number' ? d.updatedAt : 0
		};
	}
	return result;
}

export function serializeDecks(decks: Record<string, Deck>): string {
	return JSON.stringify({ version: 1, decks });
}
