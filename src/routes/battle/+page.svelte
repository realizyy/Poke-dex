<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { teamStore } from '$lib/stores/team';
	import { battleStore } from '$lib/stores/battle-store';
	import type { Team } from '$lib/types';
	import BattleArena from '../../components/battle/BattleArena.svelte';
	import TeamSelector from '../../components/battle/TeamSelector.svelte';
	
	let teams: Team[] = [];
	
	onMount(() => {
		// Load teams
		teamStore.loadTeams();
		
		// Reset battle state when entering page
		battleStore.resetAll();
	});
	
	onDestroy(() => {
		// Reset battle state when leaving page
		battleStore.resetAll();
	});
	
	// Subscribe to teams (reactive)
	teamStore.subscribe((value: Team[]) => {
		teams = value;
	});
	
	// Get teams with Pokemon
	$: eligibleTeams = teams.filter(team => team.pokemons.length > 0);
</script>

<svelte:head>
	<title>Battle Simulator - Pokédex</title>
	<meta name="description" content="Test your Pokémon teams in simulated battles with type effectiveness calculations." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
	{#if eligibleTeams.length < 2}
		<!-- Need More Teams Message -->
		<div class="theme-bg-secondary rounded-xl shadow-lg p-12 theme-border" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
			<div class="text-center">
				<svg class="mx-auto h-16 w-16 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
				</svg>
				<h3 class="mt-4 text-xl font-medium theme-text">Need More Teams</h3>
				<p class="mt-2 theme-text-secondary mb-6">
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
		<!-- Team Selection Component -->
		<TeamSelector {eligibleTeams} />
		
		<!-- Battle Arena Component -->
		<BattleArena />
	{/if}
</div>
