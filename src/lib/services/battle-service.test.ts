import { afterEach, describe, expect, it, vi } from 'vitest';
import { makeTeamPokemon } from '#lib/testing/fixtures';
import { BattleService } from './battle-service';

afterEach(() => vi.restoreAllMocks());

function fixRandom(value: number) {
	vi.spyOn(Math, 'random').mockReturnValue(value);
}

describe('BattleService.extractPokemonStats', () => {
	it('reads hp, attack, defense and speed from base stats', () => {
		const mon = makeTeamPokemon({ stats: { hp: 80, attack: 90, defense: 70, speed: 60 } });
		expect(BattleService.extractPokemonStats(mon)).toEqual({
			hp: 80,
			maxHp: 80,
			attack: 90,
			defense: 70,
			speed: 60
		});
	});
});

describe('BattleService.calculateDamage', () => {
	it('doubles damage against a weak type and says so', () => {
		fixRandom(0.5);
		const fire = makeTeamPokemon({ types: ['fire'] });
		const grass = makeTeamPokemon({ types: ['grass'] });
		const neutral = makeTeamPokemon({ types: ['normal'] });
		const base = BattleService.calculateDamage(fire, neutral, 'fire');
		const boosted = BattleService.calculateDamage(fire, grass, 'fire');
		expect(boosted.effectiveness).toBe(2);
		expect(boosted.message).toBe("It's super effective!");
		expect(boosted.damage).toBe(base.damage * 2);
	});

	it('halves damage against a resisting type', () => {
		fixRandom(0.5);
		const result = BattleService.calculateDamage(
			makeTeamPokemon({ types: ['fire'] }),
			makeTeamPokemon({ types: ['water'] }),
			'fire'
		);
		expect(result.effectiveness).toBe(0.5);
		expect(result.message).toBe("It's not very effective...");
	});

	it('deals no damage to an immune target', () => {
		fixRandom(0.5);
		const result = BattleService.calculateDamage(
			makeTeamPokemon({ types: ['normal'] }),
			makeTeamPokemon({ types: ['ghost'] }),
			'normal'
		);
		expect(result.effectiveness).toBe(0);
		expect(result.message).toBe('It has no effect!');
		expect(result.damage).toBe(0);
	});

	it('always deals at least 1 damage to a target that is not immune', () => {
		fixRandom(0);
		const weak = makeTeamPokemon({ stats: { attack: 1 } });
		const tank = makeTeamPokemon({ stats: { defense: 255 } });
		expect(BattleService.calculateDamage(weak, tank, 'normal').damage).toBeGreaterThanOrEqual(1);
	});
});

describe('BattleService.getRandomMove and getMoveType', () => {
	it('falls back to tackle with an empty moveset', () => {
		expect(BattleService.getRandomMove(makeTeamPokemon())).toBe('tackle');
	});

	it('uses the first type as the move type', () => {
		expect(BattleService.getMoveType(makeTeamPokemon({ types: ['water', 'ground'] }))).toBe(
			'water'
		);
	});
});

describe('BattleService.simulateBattle', () => {
	it('lets the much stronger Pokemon win and reports each log line', () => {
		fixRandom(0.5);
		const strong = makeTeamPokemon({ name: 'strong', stats: { hp: 200, attack: 200, speed: 100 } });
		const weak = makeTeamPokemon({ name: 'weak', stats: { hp: 20, defense: 20, speed: 10 } });
		const lines: string[] = [];
		const result = BattleService.simulateBattle(strong, weak, (line) => lines.push(line));
		expect(result.winner).toBe('team1');
		expect(result.winnerPokemon).toBe(strong);
		expect(result.loserPokemon).toBe(weak);
		expect(lines).toContain('weak fainted!');
		expect(lines.at(-1)).toBe('strong wins!');
	});

	it('lets the faster Pokemon act first', () => {
		fixRandom(0.5);
		const slow = makeTeamPokemon({ name: 'slow', stats: { speed: 10 } });
		const fast = makeTeamPokemon({ name: 'fast', stats: { speed: 200 } });
		const lines: string[] = [];
		BattleService.simulateBattle(slow, fast, (line) => lines.push(line));
		const firstMove = lines.find((line) => line.includes('used'));
		expect(firstMove).toContain('fast used');
	});

	it('ends in a draw when nobody can finish the other within 20 turns', () => {
		fixRandom(0);
		const a = makeTeamPokemon({ stats: { hp: 255, attack: 1, defense: 255 } });
		const b = makeTeamPokemon({ stats: { hp: 255, attack: 1, defense: 255 } });
		const result = BattleService.simulateBattle(a, b);
		expect(result.winner).toBe('draw');
		expect(result.totalTurns).toBe(20);
	});
});
