import type { Item } from '#lib/types';

export function isItem(value: unknown): value is Item {
	const item = value as Partial<Item> | null;
	return !!item && typeof item.id === 'number' && !!item.name && !!item.category?.name;
}

export function getItemCost(item: Pick<Item, 'cost' | 'prices'>): number | null {
	if (typeof item.cost === 'number') return item.cost;
	const purchase = item.prices?.find((p) => p.purchase_price != null)?.purchase_price;
	if (purchase != null) return purchase;
	return item.prices?.length ? 0 : null;
}
