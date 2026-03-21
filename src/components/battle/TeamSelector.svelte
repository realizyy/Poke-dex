<script lang="ts">
	import { battleStore } from '$lib/stores/battle-store.svelte';
	import type { Team } from '$lib/types';

	let { eligibleTeams }: { eligibleTeams: Team[] } = $props();

	function handleTeam1Change(event: Event) {
		const target = event.target as HTMLSelectElement;
		const team = target.value ? eligibleTeams.find(t => t.id === target.value) ?? null : null;
		battleStore.selectTeam1(team);
	}

	function handleTeam2Change(event: Event) {
		const target = event.target as HTMLSelectElement;
		const team = target.value ? eligibleTeams.find(t => t.id === target.value) ?? null : null;
		battleStore.selectTeam2(team);
	}
</script>

<div class="theme-bg-secondary rounded-xl shadow-lg p-6 theme-border mb-8" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-xl font-semibold theme-text">Select Teams to Battle</h2>
		{#if battleStore.selectedTeam1 || battleStore.selectedTeam2}
			<button onclick={() => battleStore.resetAll()} class="btn btn-neutral btn-sm">
				Reset All
			</button>
		{/if}
	</div>

	<!-- Three-column layout: Team1 | VS | Team2 -->
	<div class="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
		<!-- Team 1 -->
		<div>
			<label for="team1-select" class="block text-sm font-medium theme-text-secondary mb-2">
				🔵 Team 1
			</label>
			<select
				id="team1-select"
				value={battleStore.selectedTeam1?.id || ''}
				onchange={handleTeam1Change}
				class="select select-bordered w-full"
				style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
			>
				<option value="">Select a team...</option>
				{#each eligibleTeams as team}
					<option value={team.id} disabled={battleStore.selectedTeam2?.id === team.id}>
						{team.name} ({team.pokemons.length} Pokémon)
					</option>
				{/each}
			</select>
			<!-- Team 1 sprite preview -->
			{#if battleStore.selectedTeam1}
				<div class="mt-3 flex flex-wrap gap-2">
					{#each battleStore.selectedTeam1.pokemons as tp}
						<img
						src={tp.pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
							alt={tp.pokemon.name}
							class="w-10 h-10 object-contain"
							title={tp.nickname || tp.pokemon.name}
							width="40" height="40"
						/>
					{/each}
				</div>
			{/if}
		</div>

		<!-- VS badge -->
		<div class="hidden md:flex items-center justify-center px-2 pt-8">
			<span class="text-2xl font-black theme-text-muted select-none">VS</span>
		</div>

		<!-- Team 2 -->
		<div>
			<label for="team2-select" class="block text-sm font-medium theme-text-secondary mb-2">
				🔴 Team 2
			</label>
			<select
				id="team2-select"
				value={battleStore.selectedTeam2?.id || ''}
				onchange={handleTeam2Change}
				class="select select-bordered w-full"
				style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
			>
				<option value="">Select a team...</option>
				{#each eligibleTeams as team}
					<option value={team.id} disabled={battleStore.selectedTeam1?.id === team.id}>
						{team.name} ({team.pokemons.length} Pokémon)
					</option>
				{/each}
			</select>
			<!-- Team 2 sprite preview -->
			{#if battleStore.selectedTeam2}
				<div class="mt-3 flex flex-wrap gap-2">
					{#each battleStore.selectedTeam2.pokemons as tp}
						<img
						src={tp.pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
							alt={tp.pokemon.name}
							class="w-10 h-10 object-contain"
							title={tp.nickname || tp.pokemon.name}
							width="40" height="40"
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>