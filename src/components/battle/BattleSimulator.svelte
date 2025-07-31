<script lang="ts">
	import type { Team, TeamPokemon } from '$lib/types';
	import {
		calculateTypeWeaknesses,
		TYPE_EFFECTIVENESS,
		getTypeColor
	} from '$lib/utils/pokemon-utils';
	import PokemonCard from '../ui/PokemonCard.svelte';

	export let team1: Team;
	export let team2: Team;

	let selectedPokemon1: TeamPokemon | null = null;
	let selectedPokemon2: TeamPokemon | null = null;
	let battleLog: string[] = [];
	let battleInProgress = false;

	function selectPokemon(teamPokemon: TeamPokemon, team: number) {
		if (team === 1) {
			selectedPokemon1 = teamPokemon;
		} else {
			selectedPokemon2 = teamPokemon;
		}
	}

	function calculateDamage(
		attacker: TeamPokemon,
		defender: TeamPokemon,
		moveType: string
	): {
		damage: number;
		effectiveness: number;
		message: string;
	} {
		const attackerAttack =
			attacker.pokemon.stats.find((s) => s.stat.name === 'attack')?.base_stat || 0;
		const defenderDefense =
			defender.pokemon.stats.find((s) => s.stat.name === 'defense')?.base_stat || 0;
		const defenderHP = defender.pokemon.stats.find((s) => s.stat.name === 'hp')?.base_stat || 0;

		// Simple damage calculation
		let baseDamage = Math.max(1, attackerAttack - defenderDefense / 2);

		// Type effectiveness
		let effectiveness = 1;
		const defenderTypes = defender.pokemon.types.map((t) => t.type.name);

		defenderTypes.forEach((defType) => {
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

		const finalDamage = Math.round(baseDamage * effectiveness);

		let message = '';
		if (effectiveness > 1) {
			message = "It's super effective!";
		} else if (effectiveness < 1 && effectiveness > 0) {
			message = "It's not very effective...";
		} else if (effectiveness === 0) {
			message = 'It has no effect!';
		}

		return { damage: finalDamage, effectiveness, message };
	}

	function simulateBattle() {
		if (!selectedPokemon1 || !selectedPokemon2) return;

		battleInProgress = true;
		battleLog = [];

		const pokemon1 = selectedPokemon1;
		const pokemon2 = selectedPokemon2;

		let hp1 = pokemon1.pokemon.stats.find((s) => s.stat.name === 'hp')?.base_stat || 100;
		let hp2 = pokemon2.pokemon.stats.find((s) => s.stat.name === 'hp')?.base_stat || 100;
		const maxHP1 = hp1;
		const maxHP2 = hp2;

		battleLog.push(
			`${pokemon1.nickname || pokemon1.pokemon.name} vs ${pokemon2.nickname || pokemon2.pokemon.name}!`
		);
		battleLog.push(`${pokemon1.nickname || pokemon1.pokemon.name}: ${hp1} HP`);
		battleLog.push(`${pokemon2.nickname || pokemon2.pokemon.name}: ${hp2} HP`);
		battleLog.push('---');

		let turn = 1;
		const maxTurns = 20;

		while (hp1 > 0 && hp2 > 0 && turn <= maxTurns) {
			// Determine turn order based on speed
			const speed1 = pokemon1.pokemon.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0;
			const speed2 = pokemon2.pokemon.stats.find((s) => s.stat.name === 'speed')?.base_stat || 0;

			let firstAttacker, secondAttacker, firstHP, secondHP;
			if (speed1 >= speed2) {
				firstAttacker = pokemon1;
				secondAttacker = pokemon2;
				firstHP = hp1;
				secondHP = hp2;
			} else {
				firstAttacker = pokemon2;
				secondAttacker = pokemon1;
				firstHP = hp2;
				secondHP = hp1;
			}

			battleLog.push(`Turn ${turn}:`);

			// First attacker's turn
			const move1 =
				firstAttacker.moves[Math.floor(Math.random() * firstAttacker.moves.length)] || 'tackle';
			const moveType1 = firstAttacker.pokemon.types[0].type.name; // Simplified - use first type as move type

			const result1 = calculateDamage(firstAttacker, secondAttacker, moveType1);
			if (speed1 >= speed2) {
				hp2 -= result1.damage;
			} else {
				hp1 -= result1.damage;
			}

			battleLog.push(`${firstAttacker.nickname || firstAttacker.pokemon.name} used ${move1}!`);
			if (result1.message) {
				battleLog.push(result1.message);
			}
			battleLog.push(
				`${secondAttacker.nickname || secondAttacker.pokemon.name} took ${result1.damage} damage!`
			);

			// Check if second Pokemon fainted
			if ((speed1 >= speed2 && hp2 <= 0) || (speed1 < speed2 && hp1 <= 0)) {
				battleLog.push(`${secondAttacker.nickname || secondAttacker.pokemon.name} fainted!`);
				break;
			}

			// Second attacker's turn
			const move2 =
				secondAttacker.moves[Math.floor(Math.random() * secondAttacker.moves.length)] || 'tackle';
			const moveType2 = secondAttacker.pokemon.types[0].type.name;

			const result2 = calculateDamage(secondAttacker, firstAttacker, moveType2);
			if (speed1 >= speed2) {
				hp1 -= result2.damage;
			} else {
				hp2 -= result2.damage;
			}

			battleLog.push(`${secondAttacker.nickname || secondAttacker.pokemon.name} used ${move2}!`);
			if (result2.message) {
				battleLog.push(result2.message);
			}
			battleLog.push(
				`${firstAttacker.nickname || firstAttacker.pokemon.name} took ${result2.damage} damage!`
			);

			// Check if first Pokemon fainted
			if ((speed1 >= speed2 && hp1 <= 0) || (speed1 < speed2 && hp2 <= 0)) {
				battleLog.push(`${firstAttacker.nickname || firstAttacker.pokemon.name} fainted!`);
				break;
			}

			battleLog.push(
				`${pokemon1.nickname || pokemon1.pokemon.name}: ${Math.max(0, hp1)}/${maxHP1} HP`
			);
			battleLog.push(
				`${pokemon2.nickname || pokemon2.pokemon.name}: ${Math.max(0, hp2)}/${maxHP2} HP`
			);
			battleLog.push('---');

			turn++;
		}

		// Determine winner
		if (hp1 <= 0 && hp2 <= 0) {
			battleLog.push("It's a tie!");
		} else if (hp1 <= 0) {
			battleLog.push(`${pokemon2.nickname || pokemon2.pokemon.name} wins!`);
		} else if (hp2 <= 0) {
			battleLog.push(`${pokemon1.nickname || pokemon1.pokemon.name} wins!`);
		} else {
			battleLog.push('Battle ended in a draw (turn limit reached)!');
		}

		battleInProgress = false;
		// Force reactivity update
		battleLog = [...battleLog];
	}

	function resetBattle() {
		selectedPokemon1 = null;
		selectedPokemon2 = null;
		battleLog = [];
		battleInProgress = false;
	}
</script>

<div
	class="rounded-xl border border-gray-200 bg-white p-6 shadow-lg dark:border-gray-700 dark:bg-gray-800"
>
	<div class="mb-6 flex items-center justify-between">
		<h2 class="text-2xl font-bold text-gray-900 dark:text-white">Battle Simulator</h2>
		<button
			on:click={resetBattle}
			class="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
		>
			Reset
		</button>
	</div>

	<!-- Team Selection -->
	<div class="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
		<!-- Team 1 -->
		<div>
			<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{team1.name}</h3>
			<div class="space-y-3">
				{#each team1.pokemons as teamPokemon}
					<button
						on:click={() => selectPokemon(teamPokemon, 1)}
						class="w-full rounded-lg border-2 p-3 text-left transition-all {selectedPokemon1 ===
						teamPokemon
							? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
							: 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'}"
					>
						<div class="flex items-center gap-3">
							<img
								src={teamPokemon.pokemon.sprites.other['official-artwork'].front_default ||
									'/favicon.png'}
								alt={teamPokemon.pokemon.name}
								class="h-12 w-12 object-contain"
							/>
							<div class="flex-1">
								<div class="font-semibold text-gray-900 dark:text-white">
									{teamPokemon.nickname || teamPokemon.pokemon.name}
								</div>
								<div class="mt-1 flex gap-1">
									{#each teamPokemon.pokemon.types as type}
										<span
											class="rounded-full px-2 py-1 text-xs font-semibold text-white"
											style="background-color: {getTypeColor(type.type.name)}"
										>
											{type.type.name}
										</span>
									{/each}
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		</div>

		<!-- Team 2 -->
		<div>
			<h3 class="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{team2.name}</h3>
			<div class="space-y-3">
				{#each team2.pokemons as teamPokemon}
					<button
						on:click={() => selectPokemon(teamPokemon, 2)}
						class="w-full rounded-lg border-2 p-3 text-left transition-all {selectedPokemon2 ===
						teamPokemon
							? 'border-red-500 bg-red-50 dark:bg-red-900/20'
							: 'border-gray-200 hover:border-gray-300 dark:border-gray-600 dark:hover:border-gray-500'}"
					>
						<div class="flex items-center gap-3">
							<img
								src={teamPokemon.pokemon.sprites.other['official-artwork'].front_default ||
									'/favicon.png'}
								alt={teamPokemon.pokemon.name}
								class="h-12 w-12 object-contain"
							/>
							<div class="flex-1">
								<div class="font-semibold text-gray-900 dark:text-white">
									{teamPokemon.nickname || teamPokemon.pokemon.name}
								</div>
								<div class="mt-1 flex gap-1">
									{#each teamPokemon.pokemon.types as type}
										<span
											class="rounded-full px-2 py-1 text-xs font-semibold text-white"
											style="background-color: {getTypeColor(type.type.name)}"
										>
											{type.type.name}
										</span>
									{/each}
								</div>
							</div>
						</div>
					</button>
				{/each}
			</div>
		</div>
	</div>

	<!-- Battle Controls -->
	<div class="mb-6 text-center">
		<button
			on:click={simulateBattle}
			disabled={!selectedPokemon1 || !selectedPokemon2 || battleInProgress}
			class="rounded-lg bg-green-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
		>
			{#if battleInProgress}
				Battling...
			{:else if !selectedPokemon1 || !selectedPokemon2}
				Select Pokémon to Battle
			{:else}
				Start Battle!
			{/if}
		</button>
	</div>

	<!-- Battle Log -->
	{#if battleLog.length > 0}
		<div class="max-h-96 overflow-y-auto rounded-lg bg-gray-50 p-4 dark:bg-gray-700">
			<h4 class="mb-3 font-semibold text-gray-900 dark:text-white">Battle Log</h4>
			<div class="space-y-1 font-mono text-sm">
				{#each battleLog as logEntry}
					<div
						class="text-gray-700 dark:text-gray-300 {logEntry.includes('wins!') ||
						logEntry.includes('fainted!')
							? 'font-bold text-red-600 dark:text-red-400'
							: ''} {logEntry.includes('super effective')
							? 'text-green-600 dark:text-green-400'
							: ''} {logEntry.includes('not very effective')
							? 'text-yellow-600 dark:text-yellow-400'
							: ''} {logEntry.includes('no effect') ? 'text-gray-500 dark:text-gray-400' : ''}"
					>
						{logEntry}
					</div>
				{/each}
			</div>
		</div>
	{/if}
</div>
