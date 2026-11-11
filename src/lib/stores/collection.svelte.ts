import { browser } from '$app/env';
import {
	parseCollection,
	serializeCollection,
	setOwned,
	toggleWishlist,
	type CardRef,
	type Collection,
	type CollectionEntry
} from '#lib/utils/collection';

const STORAGE_KEY = 'tcg-collection';

class CollectionStore {
	entries: Collection = $state({});
	loaded = $state(false);

	load() {
		if (!browser || this.loaded) return;
		try {
			const saved = localStorage.getItem(STORAGE_KEY);
			if (saved) this.entries = parseCollection(JSON.parse(saved));
		} catch {
			console.error('Failed to read the card collection from localStorage');
		}
		this.loaded = true;
	}

	get(cardId: string): CollectionEntry | undefined {
		return this.entries[cardId];
	}

	setOwned(card: CardRef, quantity: number) {
		this.commit(setOwned(this.entries, card, quantity));
	}

	adjustOwned(card: CardRef, delta: number) {
		this.setOwned(card, (this.entries[card.id]?.owned ?? 0) + delta);
	}

	toggleWishlist(card: CardRef) {
		this.commit(toggleWishlist(this.entries, card));
	}

	/** Replaces the whole collection with the entries found in an exported file. */
	importJson(text: string): number {
		const imported = parseCollection(JSON.parse(text));
		this.commit(imported);
		return Object.keys(imported).length;
	}

	exportJson(): string {
		return serializeCollection(this.entries);
	}

	private commit(next: Collection) {
		this.entries = next;
		if (browser) localStorage.setItem(STORAGE_KEY, serializeCollection(next));
	}
}

export const collectionStore = new CollectionStore();
