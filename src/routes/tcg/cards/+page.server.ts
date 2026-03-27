import type { PageServerLoad } from './$types';
import { TcgService } from '$lib/services/tcg-service';

export const load: PageServerLoad = async ({ url }) => {
	const name = url.searchParams.get('q') ?? '';
	const types = url.searchParams.get('types') ?? '';
	const rarity = url.searchParams.get('rarity') ?? '';
	const hpMin = url.searchParams.get('hpMin') ? parseInt(url.searchParams.get('hpMin')!) : undefined;
	const hpMax = url.searchParams.get('hpMax') ? parseInt(url.searchParams.get('hpMax')!) : undefined;
	const setId = url.searchParams.get('setId') ?? '';
	const page = parseInt(url.searchParams.get('page') ?? '1');

	try {
		const cards = await TcgService.searchCards({
			name: name || undefined,
			types: types || undefined,
			rarity: rarity || undefined,
			hpMin,
			hpMax,
			setId: setId || undefined,
			page,
			itemsPerPage: 24,
		});
		return { cards, query: { name, types, rarity, hpMin, hpMax, setId, page } };
	} catch {
		return { cards: [], query: { name, types, rarity, hpMin, hpMax, setId, page } };
	}
};
