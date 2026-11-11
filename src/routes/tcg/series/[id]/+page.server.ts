import type { PageServerLoad } from './$types';
import { failLoad } from '#lib/api/load-error';
import { TcgService } from '#lib/services/tcg-service';

export const load: PageServerLoad = async ({ params, parent }) => {
	const { lang } = await parent();
	try {
		return { serie: await TcgService.fetchSerie(params.id, lang) };
	} catch (cause) {
		failLoad(cause, `TCG series '${params.id}' was not found`);
	}
};
