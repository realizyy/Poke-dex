import type { PageServerLoad } from './$types';
import { NatureService } from '$lib/services/move-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
	try {
		const natures = await NatureService.fetchAllNatures();
		return { natures };
	} catch (e) {
		throw error(500, 'Failed to load natures');
	}
};
