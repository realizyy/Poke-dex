import { describe, expect, it } from 'vitest';
import {
	buildLearnset,
	formatVersionGroup,
	getDefaultVersionGroup,
	getVersionGroups
} from './learnset';

type Moves = Parameters<typeof getVersionGroups>[0];

function entry(move: string, details: [string, string, number][]): Moves[number] {
	return {
		move: { name: move },
		version_group_details: details.map(([group, method, level]) => ({
			version_group: { name: group },
			move_learn_method: { name: method },
			level_learned_at: level
		}))
	};
}

const moves: Moves = [
	entry('thunderbolt', [
		['red-blue', 'machine', 0],
		['yellow', 'level-up', 26],
		['scarlet-violet', 'machine', 0]
	]),
	entry('thunder-shock', [
		['red-blue', 'level-up', 1],
		['scarlet-violet', 'level-up', 1]
	]),
	entry('quick-attack', [['scarlet-violet', 'level-up', 5]]),
	entry('volt-tackle', [['scarlet-violet', 'egg', 0]]),
	entry('surf', [['scarlet-violet', 'stadium-surfing-pikachu', 0]])
];

describe('getVersionGroups', () => {
	it('lists the groups present, newest first', () => {
		expect(getVersionGroups(moves)).toEqual(['scarlet-violet', 'yellow', 'red-blue']);
	});

	it('treats a group it does not know as newer than any known group', () => {
		const withFuture: Moves = [
			...moves,
			entry('future-move', [['some-future-game', 'level-up', 3]])
		];
		expect(getVersionGroups(withFuture)[0]).toBe('some-future-game');
	});

	it('returns nothing for a Pokemon without move data', () => {
		expect(getVersionGroups([])).toEqual([]);
	});
});

describe('buildLearnset', () => {
	it('keeps only the chosen version group and splits by method', () => {
		const learnset = buildLearnset(moves, 'scarlet-violet');
		expect(learnset['level-up'].map((e) => e.move)).toEqual(['thunder-shock', 'quick-attack']);
		expect(learnset.machine.map((e) => e.move)).toEqual(['thunderbolt']);
		expect(learnset.egg.map((e) => e.move)).toEqual(['volt-tackle']);
		expect(learnset.other.map((e) => e.move)).toEqual(['surf']);
	});

	it('orders level-up moves by level then name', () => {
		const learnset = buildLearnset(
			[
				entry('b-move', [['yellow', 'level-up', 10]]),
				entry('a-move', [['yellow', 'level-up', 10]]),
				entry('c-move', [['yellow', 'level-up', 2]])
			],
			'yellow'
		);
		expect(learnset['level-up'].map((e) => e.move)).toEqual(['c-move', 'a-move', 'b-move']);
	});

	it('does not repeat a move that is listed twice for the same method and level', () => {
		const learnset = buildLearnset(
			[
				entry('tackle', [
					['yellow', 'level-up', 1],
					['yellow', 'level-up', 1]
				])
			],
			'yellow'
		);
		expect(learnset['level-up']).toHaveLength(1);
	});

	it('returns empty lists for a group the Pokemon is not in', () => {
		const learnset = buildLearnset(moves, 'crystal');
		expect(Object.values(learnset).every((list) => list.length === 0)).toBe(true);
	});
});

describe('formatVersionGroup', () => {
	it('makes a readable title', () => {
		expect(formatVersionGroup('lets-go-pikachu-lets-go-eevee')).toBe(
			'Lets Go Pikachu Lets Go Eevee'
		);
	});
});

describe('getDefaultVersionGroup', () => {
	it('picks the newest group that has level-up moves', () => {
		const onlyOtherInNewest: Moves = [
			entry('surf', [['champions', 'stadium-surfing-pikachu', 0]]),
			entry('tackle', [['scarlet-violet', 'level-up', 1]])
		];
		expect(getDefaultVersionGroup(onlyOtherInNewest)).toBe('scarlet-violet');
	});

	it('falls back to the newest group when nothing is learned by level', () => {
		expect(getDefaultVersionGroup([entry('x', [['crystal', 'machine', 0]])])).toBe('crystal');
		expect(getDefaultVersionGroup([])).toBe('');
	});
});
