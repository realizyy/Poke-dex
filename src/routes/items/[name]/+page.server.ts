import type { PageServerLoad } from './$types';
import { ItemService } from '$lib/services/item-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const item = await ItemService.fetchItem(params.name);
		// If it's a berry category, also fetch berry data
		let berry = null;
		if (item.category.name.includes('berries') || item.category.name === 'baking-only') {
			const berryName = item.name.replace(/-item$/, '');
			try {
				berry = await ItemService.fetchBerry(berryName);
			} catch {
				// Not all berry-category items are actual berries — swallow error
			}
		}
		return { item, berry };
	} catch (e) {
		throw error(404, `Item "${params.name}" not found`);
	}
};
