import { describe, expect, it } from 'vitest';
import { makePokemon } from '#lib/testing/fixtures';
import { SortUtils } from './sort-utils';

const bulbasaur = makePokemon({ id: 1, name: 'bulbasaur', stats: { hp: 45 } });
const charizard = makePokemon({ id: 6, name: 'charizard', stats: { hp: 78, attack: 84 } });
const abra = makePokemon({ id: 63, name: 'abra', stats: { hp: 25 } });
const list = [charizard, abra, bulbasaur];

describe('SortUtils.sortPokemon', () => {
	it('sorts by id in both directions', () => {
		expect(SortUtils.sortPokemon(list, 'id', 'asc').map((p) => p.id)).toEqual([1, 6, 63]);
		expect(SortUtils.sortPokemon(list, 'id', 'desc').map((p) => p.id)).toEqual([63, 6, 1]);
	});

	it('sorts by name', () => {
		expect(SortUtils.sortPokemon(list, 'name', 'asc').map((p) => p.name)).toEqual([
			'abra',
			'bulbasaur',
			'charizard'
		]);
	});

	it('sorts by total base stats', () => {
		expect(SortUtils.sortPokemon(list, 'stats', 'desc').map((p) => p.name)).toEqual([
			'charizard',
			'bulbasaur',
			'abra'
		]);
	});

	it('does not mutate the input and handles empty input', () => {
		const copy = [...list];
		SortUtils.sortPokemon(list, 'name', 'asc');
		expect(list).toEqual(copy);
		expect(SortUtils.sortPokemon([], 'id', 'asc')).toEqual([]);
	});
});
