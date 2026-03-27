import type { PageServerLoad } from './$types';
import { TcgService } from '$lib/services/tcg-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const card = await TcgService.fetchCard(params.id);
		return { card };
	} catch {
		error(404, `TCG card '${params.id}' not found`);
	}
};
