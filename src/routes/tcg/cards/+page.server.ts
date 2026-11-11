import type { PageServerLoad } from './$types';
import { TcgService } from '#lib/services/tcg-service';
import { supportsValueFilters } from '#lib/utils/tcg-lang';
import {
	CARD_CATEGORIES,
	CARD_SORT_FIELDS,
	DEFAULT_PAGE_SIZE,
	type CardCategory,
	type CardSortField,
	type SortDirection
} from '#lib/utils/tcg';

function intParam(value: string | null): number | undefined {
	if (value == null || value === '') return undefined;
	const parsed = parseInt(value, 10);
	return Number.isFinite(parsed) ? parsed : undefined;
}

export const load: PageServerLoad = async ({ url, parent }) => {
	const { lang } = await parent();
	const valueFilters = supportsValueFilters(lang);
	const params = url.searchParams;
	const category = valueFilters
		? CARD_CATEGORIES.find((c) => c === params.get('category'))
		: undefined;
	const sortField = CARD_SORT_FIELDS.find((f) => f.id === params.get('sort'))?.id;
	const sortOrder: SortDirection = params.get('order') === 'DESC' ? 'DESC' : 'ASC';

	const query = {
		name: params.get('q') ?? '',
		types: valueFilters ? (params.get('types') ?? '') : '',
		rarity: valueFilters ? (params.get('rarity') ?? '') : '',
		category: category ?? ('' as const),
		stage: valueFilters ? (params.get('stage') ?? '') : '',
		hpMin: intParam(params.get('hpMin')),
		hpMax: intParam(params.get('hpMax')),
		setId: params.get('setId') ?? '',
		sort: sortField ?? ('' as const),
		order: sortOrder,
		page: Math.max(1, intParam(params.get('page')) ?? 1)
	};

	try {
		const { cards, hasMore } = await TcgService.searchCards({
			name: query.name || undefined,
			types: query.types || undefined,
			rarity: query.rarity || undefined,
			category: (category as CardCategory | undefined) ?? undefined,
			stage: query.stage || undefined,
			hpMin: query.hpMin,
			hpMax: query.hpMax,
			setId: query.setId || undefined,
			sortField: sortField as CardSortField | undefined,
			sortOrder,
			lang,
			page: query.page,
			itemsPerPage: DEFAULT_PAGE_SIZE
		});
		return { cards, hasMore, query, failed: false };
	} catch (cause) {
		console.error('TCG card search failed:', cause);
		return { cards: [], hasMore: false, query, failed: true };
	}
};
