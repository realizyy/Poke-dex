<script lang="ts">
	import { battleStore } from '$lib/stores/battle-store';
	import { getTypeColor } from '$lib/utils/pokemon-utils';
	import type { BattleState, TeamPokemon } from '$lib/types';
	
	let battleState: BattleState;
	
	// Subscribe to battle store
	battleStore.subscribe(state => {
		battleState = state;
	});
	
	function selectPokemon1(pokemon: TeamPokemon) {
		battleStore.selectPokemon1(pokemon);
	}
	
	function selectPokemon2(pokemon: TeamPokemon) {
		battleStore.selectPokemon2(pokemon);
	}
	
	function startBattle() {
		battleStore.simulateBattle();
	}
	
	function resetBattle() {
		battleStore.resetBattle();
	}
	
	$: canStartBattle = battleState?.selectedPokemon1 && battleState?.selectedPokemon2 && !battleState?.battleInProgress;
</script>

{#if battleState?.selectedTeam1 && battleState?.selectedTeam2}
	<div class="rounded-xl theme-border theme-bg-secondary p-6 shadow-lg mb-8" style="border-color: var(--border-color); background-color: var(--bg-secondary);">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="text-2xl font-bold theme-text">Battle Arena</h2>
			<button
				onclick={resetBattle}
				class="rounded-lg bg-gray-500 px-4 py-2 text-white transition-colors hover:bg-gray-600"
			>
				Reset Battle
			</button>
		</div>

		<!-- Pokemon Selection -->
		<div class="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
			<!-- Team 1 Pokemon -->
			<div>
				<h3 class="mb-4 text-lg font-semibold theme-text">{battleState.selectedTeam1.name}</h3>
				<div class="space-y-3">
					{#each battleState.selectedTeam1.pokemons as teamPokemon}
						<button
							onclick={() => selectPokemon1(teamPokemon)}
							class="w-full rounded-lg border-2 p-3 text-left transition-all {battleState.selectedPokemon1 === teamPokemon
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
								: 'theme-border hover:border-blue-300'}"
							style="{battleState.selectedPokemon1 !== teamPokemon ? 'border-color: var(--border-color);' : ''}"
						>
							<div class="flex items-center gap-3">
								<img
									src={teamPokemon.pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
									alt={teamPokemon.pokemon.name}
									class="h-12 w-12 object-contain"
								/>
								<div class="flex-1">
									<div class="font-semibold theme-text capitalize">
										{teamPokemon.nickname || teamPokemon.pokemon.name}
									</div>
									<div class="mt-1 flex gap-1">
										{#each teamPokemon.pokemon.types as type}
											<span
												class="rounded-full px-2 py-1 text-xs font-semibold text-white capitalize"
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

			<!-- Team 2 Pokemon -->
			<div>
				<h3 class="mb-4 text-lg font-semibold theme-text">{battleState.selectedTeam2.name}</h3>
				<div class="space-y-3">
					{#each battleState.selectedTeam2.pokemons as teamPokemon}
						<button
							onclick={() => selectPokemon2(teamPokemon)}
							class="w-full rounded-lg border-2 p-3 text-left transition-all {battleState.selectedPokemon2 === teamPokemon
								? 'border-red-500 bg-red-50 dark:bg-red-900/20'
								: 'theme-border hover:border-red-300'}"
							style="{battleState.selectedPokemon2 !== teamPokemon ? 'border-color: var(--border-color);' : ''}"
						>
							<div class="flex items-center gap-3">
								<img
									src={teamPokemon.pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
									alt={teamPokemon.pokemon.name}
									class="h-12 w-12 object-contain"
								/>
								<div class="flex-1">
									<div class="font-semibold theme-text capitalize">
										{teamPokemon.nickname || teamPokemon.pokemon.name}
									</div>
									<div class="mt-1 flex gap-1">
										{#each teamPokemon.pokemon.types as type}
											<span
												class="rounded-full px-2 py-1 text-xs font-semibold text-white capitalize"
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
				onclick={startBattle}
				disabled={!canStartBattle}
				class="rounded-lg bg-green-500 px-8 py-3 text-lg font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:bg-gray-400"
			>
				{#if battleState.battleInProgress}
					Battling...
				{:else if !battleState.selectedPokemon1 || !battleState.selectedPokemon2}
					Select Pokémon to Battle
				{:else}
					Start Battle!
				{/if}
			</button>
		</div>

		<!-- Battle Log -->
		{#if battleState.battleLog.length > 0}
			<div class="max-h-96 overflow-y-auto rounded-lg theme-bg-tertiary p-4" style="background-color: var(--bg-tertiary);">
				<h4 class="mb-3 font-semibold theme-text">Battle Log</h4>
				<div class="space-y-1 font-mono text-sm">
					{#each battleState.battleLog as logEntry}
						<div
							class="theme-text-secondary {logEntry.includes('wins!') || logEntry.includes('fainted!')
								? 'font-bold text-red-600 dark:text-red-400'
								: ''} {logEntry.includes('super effective')
								? 'text-green-600 dark:text-green-400'
								: ''} {logEntry.includes('not very effective')
								? 'text-yellow-600 dark:text-yellow-400'
								: ''} {logEntry.includes('no effect') ? 'theme-text-muted' : ''}"
							style="{!logEntry.includes('wins!') && !logEntry.includes('fainted!') && !logEntry.includes('super effective') && !logEntry.includes('not very effective') && !logEntry.includes('no effect') ? 'color: var(--text-secondary);' : ''}"
						>
							{logEntry}
						</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Battle Result -->
		{#if battleState.battleResult}
			<div class="mt-6 rounded-lg bg-gradient-to-r from-yellow-100 to-yellow-200 dark:from-yellow-900/20 dark:to-yellow-800/20 p-6">
				<h4 class="mb-2 text-xl font-bold text-yellow-800 dark:text-yellow-200">Battle Complete!</h4>
				{#if battleState.battleResult.winner === 'draw'}
					<p class="text-yellow-700 dark:text-yellow-300">The battle ended in a draw!</p>
				{:else}
					<p class="text-yellow-700 dark:text-yellow-300">
						{battleState.battleResult.winnerPokemon?.nickname || battleState.battleResult.winnerPokemon?.pokemon.name} wins the battle!
					</p>
				{/if}
				<p class="mt-2 text-sm text-yellow-600 dark:text-yellow-400">
					Battle lasted {battleState.battleResult.totalTurns} turns
				</p>
			</div>
		{/if}
	</div>
{:else}
	<!-- No Teams Selected -->
	<div class="theme-bg-secondary rounded-xl shadow-lg p-12 theme-border" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
		<div class="text-center">
			<svg class="mx-auto h-12 w-12 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
			</svg>
			<h3 class="mt-2 text-lg font-medium theme-text">Select Both Teams</h3>
			<p class="mt-1 theme-text-secondary">
				Choose two different teams to start the battle simulation.
			</p>
		</div>
	</div>
{/if}