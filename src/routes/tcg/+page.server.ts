import type { PageServerLoad } from './$types';
import { TcgService } from '#lib/services/tcg-service';

export const load: PageServerLoad = async ({ parent }) => {
	const { lang } = await parent();
	try {
		return { series: await TcgService.fetchSeriesWithSets(lang) };
	} catch (cause) {
		console.error('Failed to load TCG series:', cause);
		return { series: [] };
	}
};
