import type { PageServerLoad } from './$types';
import { TcgService } from '$lib/services/tcg-service';

export const load: PageServerLoad = async () => {
	try {
		const series = await TcgService.fetchSeries();
		return { series };
	} catch {
		return { series: [] };
	}
};
