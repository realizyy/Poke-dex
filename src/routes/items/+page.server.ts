import type { PageServerLoad } from './$types';
import { ItemService } from '$lib/services/item-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	try {
		const [pockets, result] = await Promise.all([
			ItemService.fetchItemPockets(),
			ItemService.fetchAllItems(0, 60)
		]);
		return {
			pockets,
			initialItems: result.items,
			total: result.total
		};
	} catch (e) {
		throw error(500, 'Failed to load items');
	}
};
