import type { PageServerLoad } from './$types';
import { ItemService } from '$lib/services/item-service';

export const load: PageServerLoad = async () => {
	const berries = await ItemService.fetchAllBerries();
	return { berries };
};
