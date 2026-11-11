import { browser } from '$app/env';
import {
	adjustCardCount,
	createDeck,
	parseDecks,
	serializeDecks,
	type Deck,
	type DeckCard,
	type DeckFormat
} from '#lib/utils/deck';

const STORAGE_KEY = 'tcg-decks';

class DeckStore {
	decks: Record<string, Deck> = $state({});
	loaded = $state(false);

	get list(): Deck[] {
		return Object.values(this.decks).sort((a, b) => b.updatedAt - a.updatedAt);
	}

	load() {
		if (!browser || this.loaded) return;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) this.decks = parseDecks(JSON.parse(saved));
		} catch {
			console.error('Failed to read decks from localStorage');
		}
		this.loaded = true;
	}

	get(id: string): Deck | undefined {
		return this.decks[id];
	}

	create(name: string): Deck {
		const deck = createDeck(name, crypto.randomUUID());
		this.commit({ ...this.decks, [deck.id]: deck });
		return deck;
	}

	rename(id: string, name: string) {
		this.update(id, (deck) => ({ ...deck, name: name.trim() || 'Untitled deck' }));
	}

	setFormat(id: string, format: DeckFormat) {
		this.update(id, (deck) => ({ ...deck, format }));
	}

	adjust(id: string, card: Omit<DeckCard, 'count'>, delta: number) {
		this.update(id, (deck) => adjustCardCount(deck, card, delta));
	}

	remove(id: string) {
		const next = { ...this.decks };
		delete next[id];
		this.commit(next);
	}

	private update(id: string, change: (deck: Deck) => Deck) {
		const deck = this.decks[id];
		if (!deck) return;
		this.commit({ ...this.decks, [id]: { ...change(deck), updatedAt: Date.now() } });
	}

	private commit(next: Record<string, Deck>) {
		this.decks = next;
		if (browser) localStorage.setItem(STORAGE_KEY, serializeDecks(next));
	}
}

export const deckStore = new DeckStore();
