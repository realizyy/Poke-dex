<script lang="ts">
	import { battleStore } from '$lib/stores/battle-store.svelte';
	import { getTypeColor } from '$lib/utils/pokemon-utils';
	import type { TeamPokemon } from '$lib/types';

	let logEl: HTMLDivElement | undefined = $state(undefined);

	$effect(() => {
		// auto-scroll battle log when new entries arrive
		if (logEl && battleStore.battleLog.length > 0) {
			logEl.scrollTop = logEl.scrollHeight;
		}
	});

	function getStat(pokemon: TeamPokemon['pokemon'], statName: string): number {
		return pokemon.stats.find(s => s.stat.name === statName)?.base_stat ?? 0;
	}

	function statBarWidth(value: number, max = 255): string {
		return `${Math.min(100, Math.round((value / max) * 100))}%`;
	}

	function statColor(value: number): string {
		if (value >= 100) return '#22c55e'; // green
		if (value >= 60)  return '#eab308'; // yellow
		return '#ef4444';                   // red
	}

	const MINI_STATS = [
		{ key: 'hp',              label: 'HP' },
		{ key: 'attack',          label: 'Atk' },
		{ key: 'defense',         label: 'Def' },
		{ key: 'speed',           label: 'Spd' },
	];

	function logClass(entry: string): string {
		if (entry.includes('wins!') || entry.includes('fainted!')) return 'font-bold text-red-500 dark:text-red-400';
		if (entry.includes('super effective'))                       return 'text-green-600 dark:text-green-400';
		if (entry.includes('not very effective'))                    return 'text-amber-600 dark:text-amber-400';
		if (entry.includes('no effect'))                             return 'theme-text-muted';
		return 'theme-text-secondary';
	}
</script>

{#if battleStore.selectedTeam1 && battleStore.selectedTeam2}
	<div class="rounded-xl theme-border theme-bg-secondary p-6 shadow-lg mb-8" style="border-color: var(--border-color); background-color: var(--bg-secondary);">
		<div class="mb-6 flex items-center justify-between">
			<h2 class="text-2xl font-bold theme-text">⚔️ Battle Arena</h2>
			<button onclick={() => battleStore.resetBattle()} class="btn btn-neutral btn-sm">
				Reset Battle
			</button>
		</div>

		<!-- Pokémon picker: three columns (Team1 | VS fighters | Team2) -->
		<div class="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr]">
			<!-- Team 1 Pokémon -->
			<div>
				<h3 class="mb-3 text-base font-semibold theme-text">
					🔵 {battleStore.selectedTeam1.name}
				</h3>
				<div class="space-y-2">
					{#each battleStore.selectedTeam1.pokemons as tp}
						{@const selected = battleStore.selectedPokemon1 === tp}
						<button
							onclick={() => battleStore.selectPokemon1(tp)}
							class="w-full rounded-lg border-2 p-3 text-left transition-all {selected
								? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
								: 'hover:border-blue-300'}"
							style="{!selected ? 'border-color: var(--border-color);' : ''}"
						>
							<div class="flex items-center gap-3">
								<div class="relative shrink-0">
									<img
										src={tp.pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
										alt={tp.pokemon.name}
										class="h-14 w-14 object-contain"
										width="56" height="56" loading="lazy"
									/>
									{#if selected}
										<span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-500 text-white text-xs font-bold">✓</span>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<div class="font-semibold theme-text capitalize truncate">
										{tp.nickname || tp.pokemon.name}
									</div>
									<div class="mt-1 flex gap-1 flex-wrap">
										{#each tp.pokemon.types as type}
											<span class="rounded-full px-2 py-0.5 text-xs font-semibold text-white capitalize" style="background-color: {getTypeColor(type.type.name)}">
												{type.type.name}
											</span>
										{/each}
									</div>
									<!-- Mini stat bars -->
									<div class="mt-2 space-y-0.5">
										{#each MINI_STATS as { key, label }}
											{@const val = getStat(tp.pokemon, key)}
											<div class="flex items-center gap-1">
												<span class="w-6 text-right text-[10px] font-medium" style="color: var(--text-muted)">{label}</span>
												<div class="flex-1 h-1.5 rounded-full" style="background-color: var(--bg-tertiary)">
													<div class="h-1.5 rounded-full transition-all" style="width: {statBarWidth(val)}; background-color: {statColor(val)};"></div>
												</div>
												<span class="w-6 text-[10px]" style="color: var(--text-secondary)">{val}</span>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>

			<!-- Center: VS + selected fighters' artwork -->
			<div class="hidden lg:flex flex-col items-center justify-start gap-4 px-4 pt-8">
				{#if battleStore.selectedPokemon1}
					<img
						src={battleStore.selectedPokemon1.pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
						alt={battleStore.selectedPokemon1.pokemon.name}
						class="w-20 h-20 object-contain drop-shadow"
						width="80" height="80"
					/>
				{:else}
					<div class="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center" style="border-color: var(--border-color)">
						<span class="text-2xl">?</span>
					</div>
				{/if}

				<span class="text-3xl font-black select-none" style="color: var(--text-muted)">VS</span>

				{#if battleStore.selectedPokemon2}
					<img
						src={battleStore.selectedPokemon2.pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
						alt={battleStore.selectedPokemon2.pokemon.name}
						class="w-20 h-20 object-contain drop-shadow scale-x-[-1]"
						width="80" height="80"
					/>
				{:else}
					<div class="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center" style="border-color: var(--border-color)">
						<span class="text-2xl">?</span>
					</div>
				{/if}
			</div>

			<!-- Team 2 Pokémon -->
			<div>
				<h3 class="mb-3 text-base font-semibold theme-text">
					🔴 {battleStore.selectedTeam2.name}
				</h3>
				<div class="space-y-2">
					{#each battleStore.selectedTeam2.pokemons as tp}
						{@const selected = battleStore.selectedPokemon2 === tp}
						<button
							onclick={() => battleStore.selectPokemon2(tp)}
							class="w-full rounded-lg border-2 p-3 text-left transition-all {selected
								? 'border-red-500 bg-red-50 dark:bg-red-900/20'
								: 'hover:border-red-300'}"
							style="{!selected ? 'border-color: var(--border-color);' : ''}"
						>
							<div class="flex items-center gap-3">
								<div class="relative shrink-0">
									<img
										src={tp.pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
										alt={tp.pokemon.name}
										class="h-14 w-14 object-contain"
										width="56" height="56" loading="lazy"
									/>
									{#if selected}
										<span class="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold">✓</span>
									{/if}
								</div>
								<div class="flex-1 min-w-0">
									<div class="font-semibold theme-text capitalize truncate">
										{tp.nickname || tp.pokemon.name}
									</div>
									<div class="mt-1 flex gap-1 flex-wrap">
										{#each tp.pokemon.types as type}
											<span class="rounded-full px-2 py-0.5 text-xs font-semibold text-white capitalize" style="background-color: {getTypeColor(type.type.name)}">
												{type.type.name}
											</span>
										{/each}
									</div>
									<!-- Mini stat bars -->
									<div class="mt-2 space-y-0.5">
										{#each MINI_STATS as { key, label }}
											{@const val = getStat(tp.pokemon, key)}
											<div class="flex items-center gap-1">
												<span class="w-6 text-right text-[10px] font-medium" style="color: var(--text-muted)">{label}</span>
												<div class="flex-1 h-1.5 rounded-full" style="background-color: var(--bg-tertiary)">
													<div class="h-1.5 rounded-full transition-all" style="width: {statBarWidth(val)}; background-color: {statColor(val)};"></div>
												</div>
												<span class="w-6 text-[10px]" style="color: var(--text-secondary)">{val}</span>
											</div>
										{/each}
									</div>
								</div>
							</div>
						</button>
					{/each}
				</div>
			</div>
		</div>

		<!-- Battle button -->
		<div class="mb-6 text-center">
			<button
				onclick={() => battleStore.simulateBattle()}
				disabled={!battleStore.canStartBattle}
				class="btn btn-lg px-10 font-bold text-white disabled:opacity-40"
				style="background-color: var(--color-danger, #dc2626); border-color: var(--color-danger, #dc2626);"
			>
				{#if battleStore.battleInProgress}
					<span class="loading loading-spinner loading-sm mr-2"></span>Battling...
				{:else if !battleStore.selectedPokemon1 || !battleStore.selectedPokemon2}
					⚔️ Select Pokémon to Battle
				{:else}
					⚔️ Start Battle!
				{/if}
			</button>
		</div>

		<!-- Battle Log -->
		{#if battleStore.battleLog.length > 0}
			<div
				bind:this={logEl}
				class="max-h-72 overflow-y-auto rounded-lg p-4 mb-4"
				style="background-color: var(--bg-tertiary);"
			>
				<h4 class="mb-3 font-semibold theme-text sticky top-0" style="background-color: var(--bg-tertiary);">📜 Battle Log</h4>
				<div class="space-y-1 font-mono text-sm">
					{#each battleStore.battleLog as entry}
						<div class={logClass(entry)}>{entry}</div>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Battle Result -->
		{#if battleStore.battleResult}
			<div class="mt-2 rounded-xl p-6 text-center" style="background-color: var(--bg-tertiary); border: 2px solid var(--border-color);">
				{#if battleStore.battleResult.winner === 'draw'}
					<p class="text-2xl font-bold theme-text mb-1">🤝 It's a Draw!</p>
					<p class="theme-text-secondary">Neither Pokémon could overcome the other.</p>
				{:else}
					{@const winner = battleStore.battleResult.winnerPokemon}
					<img
						src={winner?.pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
						alt={winner?.pokemon.name}
						class="w-28 h-28 object-contain mx-auto mb-2 drop-shadow-lg"
						width="112" height="112"
					/>
					<p class="text-2xl font-bold theme-text mb-1">
						🏆 {winner?.nickname || winner?.pokemon.name} Wins!
					</p>
					<p class="theme-text-secondary text-sm">
						Battle lasted {battleStore.battleResult.totalTurns} turn{battleStore.battleResult.totalTurns === 1 ? '' : 's'}
					</p>
				{/if}
				<button onclick={() => battleStore.resetBattle()} class="btn btn-sm btn-neutral mt-4">
					Battle Again
				</button>
			</div>
		{/if}
	</div>
{:else}
	<!-- Empty state -->
	<div class="theme-bg-secondary rounded-xl shadow-lg p-12 theme-border" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
		<div class="text-center">
			<span class="text-5xl">⚔️</span>
			<h3 class="mt-4 text-lg font-semibold theme-text">Select Both Teams Above</h3>
			<p class="mt-1 theme-text-secondary">
				Choose two different teams to start the battle simulation.
			</p>
		</div>
	</div>
{/if}