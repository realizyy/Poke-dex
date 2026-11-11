export interface CardRef {
	id: string;
	setId: string;
	name: string;
	image?: string;
}

export interface CollectionEntry extends CardRef {
	owned: number;
	wishlisted: boolean;
	addedAt: number;
}

export type Collection = Record<string, CollectionEntry>;

export interface SetProgress {
	owned: number;
	wishlisted: number;
	total: number;
	percent: number;
}

export interface CollectionSummary {
	uniqueCards: number;
	totalCopies: number;
	wishlisted: number;
	sets: number;
}

const MAX_COPIES = 999;

function withEntry(collection: Collection, entry: CollectionEntry): Collection {
	const next = { ...collection };
	if (entry.owned <= 0 && !entry.wishlisted) delete next[entry.id];
	else next[entry.id] = entry;
	return next;
}

function entryFor(collection: Collection, card: CardRef, now: number): CollectionEntry {
	return (
		collection[card.id] ?? {
			id: card.id,
			setId: card.setId,
			name: card.name,
			image: card.image,
			owned: 0,
			wishlisted: false,
			addedAt: now
		}
	);
}

export function setOwned(
	collection: Collection,
	card: CardRef,
	quantity: number,
	now = Date.now()
): Collection {
	const owned = Math.min(MAX_COPIES, Math.max(0, Math.floor(quantity)));
	return withEntry(collection, { ...entryFor(collection, card, now), owned });
}

export function toggleWishlist(
	collection: Collection,
	card: CardRef,
	now = Date.now()
): Collection {
	const entry = entryFor(collection, card, now);
	return withEntry(collection, { ...entry, wishlisted: !entry.wishlisted });
}

export function setProgress(
	collection: Collection,
	setId: string,
	totalCards: number
): SetProgress {
	const inSet = Object.values(collection).filter((e) => e.setId === setId);
	const owned = inSet.filter((e) => e.owned > 0).length;
	const wishlisted = inSet.filter((e) => e.wishlisted).length;
	const percent = totalCards > 0 ? Math.min(100, Math.round((owned / totalCards) * 100)) : 0;
	return { owned, wishlisted, total: totalCards, percent };
}

export function summarize(collection: Collection): CollectionSummary {
	const entries = Object.values(collection);
	const ownedEntries = entries.filter((e) => e.owned > 0);
	return {
		uniqueCards: ownedEntries.length,
		totalCopies: ownedEntries.reduce((sum, e) => sum + e.owned, 0),
		wishlisted: entries.filter((e) => e.wishlisted).length,
		sets: new Set(entries.map((e) => e.setId)).size
	};
}

function isEntry(value: unknown): value is CollectionEntry {
	const e = value as Partial<CollectionEntry> | null;
	return (
		!!e &&
		typeof e.id === 'string' &&
		typeof e.setId === 'string' &&
		typeof e.name === 'string' &&
		typeof e.owned === 'number' &&
		e.owned >= 0 &&
		typeof e.wishlisted === 'boolean' &&
		typeof e.addedAt === 'number'
	);
}

/** Accepts anything read from storage or an import and keeps only well formed entries. */
export function parseCollection(raw: unknown): Collection {
	const entries = (raw as { entries?: unknown } | null)?.entries;
	if (!entries || typeof entries !== 'object') return {};
	const collection: Collection = {};
	for (const value of Object.values(entries)) {
		if (isEntry(value) && (value.owned > 0 || value.wishlisted)) {
			collection[value.id] = { ...value, owned: Math.min(MAX_COPIES, Math.floor(value.owned)) };
		}
	}
	return collection;
}

export function serializeCollection(collection: Collection): string {
	return JSON.stringify({ version: 1, entries: collection });
}
