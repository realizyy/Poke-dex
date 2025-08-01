<script lang="ts">
	import { battleStore } from '$lib/stores/battle-store';
	import type { Team, BattleState } from '$lib/types';
	
	export let eligibleTeams: Team[];
	
	let battleState: BattleState;
	
	// Subscribe to battle store
	battleStore.subscribe(state => {
		battleState = state;
	});
	
	function handleTeam1Change(event: Event) {
		const target = event.target as HTMLSelectElement;
		const teamId = target.value;
		const team = teamId ? eligibleTeams.find(t => t.id === teamId) || null : null;
		battleStore.selectTeam1(team);
	}
	
	function handleTeam2Change(event: Event) {
		const target = event.target as HTMLSelectElement;
		const teamId = target.value;
		const team = teamId ? eligibleTeams.find(t => t.id === teamId) || null : null;
		battleStore.selectTeam2(team);
	}
	
	function resetSelection() {
		battleStore.resetAll();
	}
</script>

<div class="theme-bg-secondary rounded-xl shadow-lg p-6 theme-border mb-8" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
	<div class="flex items-center justify-between mb-4">
		<h2 class="text-xl font-semibold theme-text">Select Teams to Battle</h2>
		{#if battleState?.selectedTeam1 || battleState?.selectedTeam2}
			<button
				onclick={resetSelection}
				class="px-4 py-2 text-sm bg-gray-500 hover:bg-gray-600 text-white rounded-lg transition-colors"
			>
				Reset Selection
			</button>
		{/if}
	</div>
	
	<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
		<!-- Team 1 Selection -->
		<div>
			<label for="team1-select" class="block text-sm font-medium theme-text-secondary mb-2">
				Team 1
			</label>
			<select 
				id="team1-select"
				value={battleState?.selectedTeam1?.id || ''}
				onchange={handleTeam1Change}
				class="w-full px-3 py-2 rounded-lg theme-border theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
				style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
			>
				<option value="">Select a team...</option>
				{#each eligibleTeams as team}
					<option value={team.id} disabled={battleState?.selectedTeam2?.id === team.id}>
						{team.name} ({team.pokemons.length} Pokémon)
					</option>
				{/each}
			</select>
		</div>
		
		<!-- Team 2 Selection -->
		<div>
			<label for="team2-select" class="block text-sm font-medium theme-text-secondary mb-2">
				Team 2
			</label>
			<select 
				id="team2-select"
				value={battleState?.selectedTeam2?.id || ''}
				onchange={handleTeam2Change}
				class="w-full px-3 py-2 rounded-lg theme-border theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
				style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
			>
				<option value="">Select a team...</option>
				{#each eligibleTeams as team}
					<option value={team.id} disabled={battleState?.selectedTeam1?.id === team.id}>
						{team.name} ({team.pokemons.length} Pokémon)
					</option>
				{/each}
			</select>
		</div>
	</div>
</div>