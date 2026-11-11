import { describe, expect, it } from 'vitest';
import { SearchFilterUtils } from './search-filter-utils';

describe('SearchFilterUtils', () => {
	it('starts empty and reports empty', () => {
		expect(SearchFilterUtils.areFiltersEmpty(SearchFilterUtils.createEmptyFilters())).toBe(true);
	});

	it('toggles a type on and off without mutating the original', () => {
		const base = SearchFilterUtils.createEmptyFilters();
		const on = SearchFilterUtils.toggleType(base, 'fire');
		expect(on.types).toEqual(['fire']);
		expect(base.types).toEqual([]);
		expect(SearchFilterUtils.toggleType(on, 'fire').types).toEqual([]);
	});

	it('toggles generations as strings', () => {
		const on = SearchFilterUtils.toggleGeneration(SearchFilterUtils.createEmptyFilters(), 3);
		expect(on.generations).toEqual(['3']);
		expect(SearchFilterUtils.toggleGeneration(on, 3).generations).toEqual([]);
	});

	it('is no longer empty once a stat filter is set', () => {
		const filters = SearchFilterUtils.updateStatFilter(
			SearchFilterUtils.createEmptyFilters(),
			'speed',
			'min',
			100
		);
		expect(SearchFilterUtils.areFiltersEmpty(filters)).toBe(false);
		expect(SearchFilterUtils.getStatValue(filters, 'speed', 'min')).toBe(100);
		expect(SearchFilterUtils.getStatValue(filters, 'speed', 'max')).toBe(180);
	});

	it('rejects a min stat above the max stat', () => {
		const filters = {
			...SearchFilterUtils.createEmptyFilters(),
			minStats: { speed: 150 },
			maxStats: { speed: 100 }
		};
		expect(SearchFilterUtils.validateFilters(filters)).toBe(false);
	});
});
