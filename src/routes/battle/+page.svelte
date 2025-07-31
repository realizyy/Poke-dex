<script lang="ts">
	import { onMount } from 'svelte';
	import { teamStore } from '$lib/stores/team';
	import type { Team } from '$lib/types';
	import BattleSimulator from '../../components/battle/BattleSimulator.svelte';
	
	let teams: Team[] = [];
	let selectedTeam1: Team | null = null;
	let selectedTeam2: Team | null = null;
	
	teamStore.subscribe((value: Team[]) => {
		teams = value;
	});
	
	onMount(() => {
		teamStore.loadTeams();
	});
	
	$: eligibleTeams = teams.filter(team => team.pokemons.length > 0);
</script>

<svelte:head>
	<title>Battle Simulator - Pokédex</title>
	<meta name="description" content="Test your Pokémon teams in simulated battles with type effectiveness calculations." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
	{#if eligibleTeams.length < 2}
	<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700">
		<div class="text-center">
			<svg class="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
			</svg>
			<h3 class="mt-4 text-xl font-medium text-gray-900 dark:text-white">Need More Teams</h3>
				<p class="mt-2 text-gray-500 dark:text-gray-400 mb-6">
					You need at least 2 teams with Pokémon to battle. Create teams in the Team Builder first.
				</p>
				<a 
					href="/teams" 
					class="inline-flex items-center px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
				>
					<svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
					</svg>
					Go to Team Builder
				</a>
			</div>
		</div>
	{:else}
		<!-- Team Selection -->
		<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 mb-8">
			<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Select Teams to Battle</h2>
			
			<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
				<!-- Team 1 Selection -->
				<div>
					<label for="team1-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Team 1
					</label>
					<select 
						id="team1-select"
						bind:value={selectedTeam1}
						class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
					>
						<option value={null}>Select a team...</option>
						{#each eligibleTeams as team}
							<option value={team} disabled={selectedTeam2?.id === team.id}>
								{team.name} ({team.pokemons.length} Pokémon)
							</option>
						{/each}
					</select>
				</div>
				
				<!-- Team 2 Selection -->
				<div>
					<label for="team2-select" class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
						Team 2
					</label>
					<select 
						id="team2-select"
						bind:value={selectedTeam2}
						class="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
					>
						<option value={null}>Select a team...</option>
						{#each eligibleTeams as team}
							<option value={team} disabled={selectedTeam1?.id === team.id}>
								{team.name} ({team.pokemons.length} Pokémon)
							</option>
						{/each}
					</select>
				</div>
			</div>
		</div>
		
		<!-- Battle Simulator -->
		{#if selectedTeam1 && selectedTeam2}
			<BattleSimulator team1={selectedTeam1} team2={selectedTeam2} />
		{:else}
			<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12 border border-gray-200 dark:border-gray-700">
				<div class="text-center">
					<svg class="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
					</svg>
					<h3 class="mt-2 text-lg font-medium text-gray-900 dark:text-white">Select Both Teams</h3>
				<p class="mt-1 text-gray-500 dark:text-gray-400">
					Choose two different teams to start the battle simulation.
				</p>
			</div>
		</div>
	{/if}
	{/if}
</div>