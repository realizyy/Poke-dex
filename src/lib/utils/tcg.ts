import type { TcgPricing } from '#lib/types';
import type { TcgLang } from './tcg-lang';

export type CardCategory = 'Pokemon' | 'Trainer' | 'Energy';
export type CardSortField = 'name' | 'hp' | 'localId';
export type SortDirection = 'ASC' | 'DESC';

export interface CardSearchFilters {
	lang?: TcgLang;
	name?: string;
	types?: string;
	rarity?: string;
	category?: CardCategory;
	stage?: string;
	hpMin?: number;
	hpMax?: number;
	setId?: string;
	sortField?: CardSortField;
	sortOrder?: SortDirection;
	page?: number;
	itemsPerPage?: number;
}

export const CARD_CATEGORIES: CardCategory[] = ['Pokemon', 'Trainer', 'Energy'];
export const CARD_SORT_FIELDS: { id: CardSortField; label: string }[] = [
	{ id: 'name', label: 'Name' },
	{ id: 'hp', label: 'HP' },
	{ id: 'localId', label: 'Card number' }
];
export const DEFAULT_PAGE_SIZE = 24;

export function buildCardSearchParams(filters: CardSearchFilters): URLSearchParams {
	const params = new URLSearchParams();
	if (filters.name) params.set('name', filters.name);
	if (filters.types) params.set('types', filters.types);
	if (filters.rarity) params.set('rarity', filters.rarity);
	if (filters.category) params.set('category', filters.category);
	if (filters.stage) params.set('stage', filters.stage);
	if (filters.hpMin != null) params.append('hp', `gte:${filters.hpMin}`);
	if (filters.hpMax != null) params.append('hp', `lte:${filters.hpMax}`);
	if (filters.setId) params.set('set.id', `eq:${filters.setId}`);
	if (filters.sortField) {
		params.set('sort:field', filters.sortField);
		params.set('sort:order', filters.sortOrder ?? 'ASC');
	}
	params.set('pagination:page', String(filters.page ?? 1));
	params.set('pagination:itemsPerPage', String(filters.itemsPerPage ?? DEFAULT_PAGE_SIZE));
	return params;
}

export interface PriceRow {
	source: 'Cardmarket' | 'TCGplayer';
	label: string;
	amount: number;
	currency: string;
}

function asNumber(value: unknown): number | null {
	return typeof value === 'number' && Number.isFinite(value) ? value : null;
}

function titleCase(slug: string): string {
	const text = slug.replace(/-/g, ' ');
	return text.charAt(0).toUpperCase() + text.slice(1);
}

const CARDMARKET_FIELDS: [string, string][] = [
	['avg', 'Average'],
	['low', 'Lowest'],
	['trend', 'Trend'],
	['avg-holo', 'Holo average'],
	['low-holo', 'Holo lowest'],
	['trend-holo', 'Holo trend']
];

export function getCardPrices(pricing: TcgPricing | undefined): PriceRow[] {
	const rows: PriceRow[] = [];

	const cardmarket = pricing?.cardmarket;
	if (cardmarket) {
		const currency = typeof cardmarket.unit === 'string' ? cardmarket.unit : 'EUR';
		for (const [field, label] of CARDMARKET_FIELDS) {
			const amount = asNumber(cardmarket[field]);
			if (amount != null) rows.push({ source: 'Cardmarket', label, amount, currency });
		}
	}

	const tcgplayer = pricing?.tcgplayer;
	if (tcgplayer) {
		const currency = typeof tcgplayer.unit === 'string' ? tcgplayer.unit : 'USD';
		for (const [finish, tier] of Object.entries(tcgplayer)) {
			if (!tier || typeof tier !== 'object') continue;
			const amount = asNumber((tier as Record<string, unknown>).marketPrice);
			if (amount != null) {
				rows.push({ source: 'TCGplayer', label: `${titleCase(finish)} market`, amount, currency });
			}
		}
	}

	return rows;
}

export function formatPrice(amount: number, currency: string): string {
	try {
		return new Intl.NumberFormat('en', { style: 'currency', currency }).format(amount);
	} catch {
		return `${amount.toFixed(2)} ${currency}`;
	}
}
