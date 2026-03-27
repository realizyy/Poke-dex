import type { PageServerLoad } from './$types';
import { TcgService } from '$lib/services/tcg-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const set = await TcgService.fetchSet(params.id);
		return { set };
	} catch {
		error(404, `TCG set '${params.id}' not found`);
	}
};
