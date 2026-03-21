import type { PageServerLoad } from './$types';
import { MoveService } from '$lib/services/move-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const move = await MoveService.fetchMove(params.name.toLowerCase());
		return { move };
	} catch (e) {
		throw error(404, `Move "${params.name}" not found`);
	}
};
