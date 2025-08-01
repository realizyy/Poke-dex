import type { TeamPokemon, BattleDamageResult, BattleResult, BattlePokemonStats } from '$lib/types';
import { TYPE_EFFECTIVENESS } from '$lib/utils/pokemon-utils';

export class BattleService {
	/**
	 * Extract Pokemon stats for battle calculations
	 */
	static extractPokemonStats(teamPokemon: TeamPokemon): BattlePokemonStats {
		const stats = teamPokemon.pokemon.stats;
		const hp = stats.find(s => s.stat.name === 'hp')?.base_stat || 100;
		const attack = stats.find(s => s.stat.name === 'attack')?.base_stat || 50;
		const defense = stats.find(s => s.stat.name === 'defense')?.base_stat || 50;
		const speed = stats.find(s => s.stat.name === 'speed')?.base_stat || 50;

		return {
			hp,
			maxHp: hp,
			attack,
			defense,
			speed
		};
	}

	/**
	 * Calculate damage between two Pokemon
	 */
	static calculateDamage(
		attacker: TeamPokemon,
		defender: TeamPokemon,
		moveType: string
	): BattleDamageResult {
		const attackerStats = this.extractPokemonStats(attacker);
		const defenderStats = this.extractPokemonStats(defender);

		// Simple damage calculation with level scaling
		const level = 50; // Standard battle level
		const power = 80; // Standard move power
		const random = Math.random() * 0.15 + 0.85; // 85-100% damage variance

		// Base damage formula (simplified Pokemon damage calculation)
		const baseDamage = Math.floor(
			((((2 * level / 5 + 2) * power * attackerStats.attack / defenderStats.defense) / 50) + 2) * random
		);

		// Type effectiveness calculation
		let effectiveness = 1;
		const defenderTypes = defender.pokemon.types.map(t => t.type.name);

		defenderTypes.forEach(defType => {
			const typeChart = TYPE_EFFECTIVENESS[moveType];
			if (typeChart) {
				if (typeChart.superEffectiveAgainst.includes(defType)) {
					effectiveness *= 2;
				} else if (typeChart.notVeryEffectiveAgainst.includes(defType)) {
					effectiveness *= 0.5;
				} else if (typeChart.noEffectAgainst.includes(defType)) {
					effectiveness *= 0;
				}
			}
		});

		const finalDamage = Math.max(1, Math.floor(baseDamage * effectiveness));

		// Generate effectiveness message
		let message = '';
		if (effectiveness > 1) {
			message = "It's super effective!";
		} else if (effectiveness < 1 && effectiveness > 0) {
			message = "It's not very effective...";
		} else if (effectiveness === 0) {
			message = 'It has no effect!';
		}

		return {
			damage: finalDamage,
			effectiveness,
			message
		};
	}

	/**
	 * Get random move from Pokemon's moveset
	 */
	static getRandomMove(teamPokemon: TeamPokemon): string {
		if (teamPokemon.moves.length === 0) {
			return 'tackle'; // Default move
		}
		return teamPokemon.moves[Math.floor(Math.random() * teamPokemon.moves.length)];
	}

	/**
	 * Get move type (simplified - uses Pokemon's first type)
	 */
	static getMoveType(teamPokemon: TeamPokemon): string {
		return teamPokemon.pokemon.types[0]?.type.name || 'normal';
	}

	/**
	 * Simulate a complete battle between two Pokemon
	 */
	static simulateBattle(
		pokemon1: TeamPokemon,
		pokemon2: TeamPokemon,
		onLogUpdate?: (log: string) => void
	): BattleResult {
		const stats1 = this.extractPokemonStats(pokemon1);
		const stats2 = this.extractPokemonStats(pokemon2);

		let hp1 = stats1.hp;
		let hp2 = stats2.hp;
		let turn = 1;
		const maxTurns = 20;
		const battleLog: string[] = [];

		const log = (message: string) => {
			battleLog.push(message);
			onLogUpdate?.(message);
		};

		log(`${pokemon1.nickname || pokemon1.pokemon.name} vs ${pokemon2.nickname || pokemon2.pokemon.name}!`);
		log(`${pokemon1.nickname || pokemon1.pokemon.name}: ${hp1} HP`);
		log(`${pokemon2.nickname || pokemon2.pokemon.name}: ${hp2} HP`);
		log('---');

		while (hp1 > 0 && hp2 > 0 && turn <= maxTurns) {
			// Determine turn order based on speed
			const firstAttacker = stats1.speed >= stats2.speed ? pokemon1 : pokemon2;
			const secondAttacker = stats1.speed >= stats2.speed ? pokemon2 : pokemon1;
			const isFirstAttackerPokemon1 = firstAttacker === pokemon1;

			log(`Turn ${turn}:`);

			// First attacker's turn
			const move1 = this.getRandomMove(firstAttacker);
			const moveType1 = this.getMoveType(firstAttacker);
			const result1 = this.calculateDamage(firstAttacker, secondAttacker, moveType1);

			if (isFirstAttackerPokemon1) {
				hp2 -= result1.damage;
			} else {
				hp1 -= result1.damage;
			}

			log(`${firstAttacker.nickname || firstAttacker.pokemon.name} used ${move1}!`);
			if (result1.message) {
				log(result1.message);
			}
			log(`${secondAttacker.nickname || secondAttacker.pokemon.name} took ${result1.damage} damage!`);

			// Check if second Pokemon fainted
			if ((isFirstAttackerPokemon1 && hp2 <= 0) || (!isFirstAttackerPokemon1 && hp1 <= 0)) {
				log(`${secondAttacker.nickname || secondAttacker.pokemon.name} fainted!`);
				break;
			}

			// Second attacker's turn
			const move2 = this.getRandomMove(secondAttacker);
			const moveType2 = this.getMoveType(secondAttacker);
			const result2 = this.calculateDamage(secondAttacker, firstAttacker, moveType2);

			if (isFirstAttackerPokemon1) {
				hp1 -= result2.damage;
			} else {
				hp2 -= result2.damage;
			}

			log(`${secondAttacker.nickname || secondAttacker.pokemon.name} used ${move2}!`);
			if (result2.message) {
				log(result2.message);
			}
			log(`${firstAttacker.nickname || firstAttacker.pokemon.name} took ${result2.damage} damage!`);

			// Check if first Pokemon fainted
			if ((isFirstAttackerPokemon1 && hp1 <= 0) || (!isFirstAttackerPokemon1 && hp2 <= 0)) {
				log(`${firstAttacker.nickname || firstAttacker.pokemon.name} fainted!`);
				break;
			}

			log(`${pokemon1.nickname || pokemon1.pokemon.name}: ${Math.max(0, hp1)}/${stats1.maxHp} HP`);
			log(`${pokemon2.nickname || pokemon2.pokemon.name}: ${Math.max(0, hp2)}/${stats2.maxHp} HP`);
			log('---');

			turn++;
		}

		// Determine winner
		let winner: 'team1' | 'team2' | 'draw';
		let winnerPokemon: TeamPokemon | undefined;
		let loserPokemon: TeamPokemon | undefined;

		if (hp1 <= 0 && hp2 <= 0) {
			winner = 'draw';
			log("It's a tie!");
		} else if (hp1 <= 0) {
			winner = 'team2';
			winnerPokemon = pokemon2;
			loserPokemon = pokemon1;
			log(`${pokemon2.nickname || pokemon2.pokemon.name} wins!`);
		} else if (hp2 <= 0) {
			winner = 'team1';
			winnerPokemon = pokemon1;
			loserPokemon = pokemon2;
			log(`${pokemon1.nickname || pokemon1.pokemon.name} wins!`);
		} else {
			winner = 'draw';
			log('Battle ended in a draw (turn limit reached)!');
		}

		return {
			winner,
			winnerPokemon,
			loserPokemon,
			totalTurns: turn - 1
		};
	}
}