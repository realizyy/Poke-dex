import { describe, expect, it } from 'vitest';
import { makePokemon, makeTeamPokemon } from '#lib/testing/fixtures';
import {
	POKEMON_TYPES,
	TYPE_EFFECTIVENESS,
	calculateTeamCoverage,
	calculateTypeWeaknesses,
	getGenerationFromId,
	getStatTotal,
	getTypeColor
} from './pokemon-utils';

describe('type chart', () => {
	it('defines every one of the 18 types', () => {
		for (const type of POKEMON_TYPES) expect(TYPE_EFFECTIVENESS[type], type).toBeDefined();
	});

	it('agrees with itself from the attacker and defender side', () => {
		const problems: string[] = [];
		for (const [attacker, chart] of Object.entries(TYPE_EFFECTIVENESS)) {
			for (const defender of chart.superEffectiveAgainst) {
				if (!TYPE_EFFECTIVENESS[defender].weakTo.includes(attacker)) {
					problems.push(
						`${attacker} hits ${defender} super effectively but ${defender} is not weakTo it`
					);
				}
			}
			for (const defender of chart.notVeryEffectiveAgainst) {
				if (!TYPE_EFFECTIVENESS[defender].resistantTo.includes(attacker)) {
					problems.push(
						`${attacker} is not very effective on ${defender} but it is not resistantTo`
					);
				}
			}
			for (const defender of chart.noEffectAgainst) {
				if (!TYPE_EFFECTIVENESS[defender].immuneTo.includes(attacker)) {
					problems.push(`${attacker} has no effect on ${defender} but it is not immuneTo`);
				}
			}
		}
		expect(problems).toEqual([]);
	});
});

describe('calculateTypeWeaknesses', () => {
	it('lists the weaknesses of a single type', () => {
		expect(calculateTypeWeaknesses(['electric']).sort()).toEqual(['ground']);
	});

	it('cancels a weakness that the other type resists or is immune to', () => {
		expect(calculateTypeWeaknesses(['water', 'ground'])).toEqual(['grass']);
	});
});

describe('calculateTeamCoverage', () => {
	it('counts weaknesses and resistances across the team', () => {
		const team = [
			makeTeamPokemon({ types: ['fire'] }),
			makeTeamPokemon({ types: ['fire', 'flying'] })
		];
		const coverage = calculateTeamCoverage(team);
		expect(coverage.weaknesses.water).toBe(2);
		expect(coverage.resistances.fire).toBe(2);
	});

	it('returns an empty report for an empty team', () => {
		expect(calculateTeamCoverage([])).toEqual({
			weaknesses: {},
			resistances: {},
			coverageScore: 0
		});
	});
});

describe('small helpers', () => {
	it('maps national dex ids to generations at the boundaries', () => {
		expect(getGenerationFromId(1)).toBe(1);
		expect(getGenerationFromId(151)).toBe(1);
		expect(getGenerationFromId(152)).toBe(2);
		expect(getGenerationFromId(905)).toBe(8);
		expect(getGenerationFromId(906)).toBe(9);
	});

	it('sums base stats', () => {
		expect(getStatTotal(makePokemon({ stats: { hp: 100 } }))).toBe(100 + 50 * 5);
	});

	it('falls back to a default color for an unknown type', () => {
		expect(getTypeColor('not-a-type')).toBe('#68A090');
	});
});
