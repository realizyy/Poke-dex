import type { PageServerLoad } from './$types';
import { AbilityService } from '$lib/services/move-service';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async ({ params }) => {
	try {
		const ability = await AbilityService.fetchAbility(params.name.toLowerCase());
		return { ability };
	} catch (e) {
		throw error(404, `Ability "${params.name}" not found`);
	}
};
