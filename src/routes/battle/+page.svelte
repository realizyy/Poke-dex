<script lang="ts">
	import { onMount } from 'svelte';
	import { teamStore } from '$lib/stores/team.svelte';
	import { battleStore } from '$lib/stores/battle-store.svelte';
	import BattleArena from '../../components/battle/BattleArena.svelte';
	import TeamSelector from '../../components/battle/TeamSelector.svelte';
	import { Users } from '$lib/icons';

	const eligibleTeams = $derived(teamStore.teams.filter(team => team.pokemons.length > 0));

	onMount(() => {
		teamStore.loadTeams();
		battleStore.loadBattleState(teamStore.teams);
	});
</script>

<svelte:head>
	<title>Battle Simulator - Pokédex</title>
	<meta name="description" content="Test your Pokémon teams in simulated battles with type effectiveness calculations." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
	<!-- Dramatic page header -->
	<div class="text-center mb-10">
		<div class="flex items-center justify-center gap-3 mb-2">
			<div class="flex-1 h-px" style="background: linear-gradient(to right, transparent, var(--border-color));"></div>
			<h1 class="pokemon-logo-style tracking-widest" style="font-size: var(--text-3xl); color: var(--brand-red); letter-spacing: 0.15em;">BATTLE ARENA</h1>
			<div class="flex-1 h-px" style="background: linear-gradient(to left, transparent, var(--border-color));"></div>
		</div>
		<p class="theme-text-secondary text-sm">Select two teams and simulate the battle.</p>
	</div>

	{#if eligibleTeams.length < 2}
		<!-- Need More Teams: VS split-screen -->
		<div class="rounded-2xl overflow-hidden shadow-xl" style="border: 1px solid var(--border-color);">
			<div class="grid grid-cols-1 sm:grid-cols-2" style="min-height: 280px;">
				<!-- Left team slot -->
				<div class="relative flex flex-col items-center justify-center p-10"
					style="background: linear-gradient(135deg, rgba(220,38,38,0.08), rgba(220,38,38,0.02));">
					<div class="w-24 h-24 pokeball-deco mb-4" style="opacity: 0.6;"></div>
					<p class="text-sm font-semibold theme-text-secondary">
						{#if eligibleTeams.length === 0}Team 1{:else}Team 2{/if}
					</p>
					<p class="text-xs theme-text-muted mt-1">
						{eligibleTeams.length === 0 ? 'Not ready' : eligibleTeams[0].name}
					</p>
				</div>

				<!-- VS badge -->
				<div class="sm:hidden flex items-center justify-center py-2" style="background-color: var(--bg-main)">
					<span class="pokemon-logo-style text-2xl" style="color: var(--brand-red);">VS</span>
				</div>
				<div class="hidden sm:flex absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full items-center justify-center shadow-lg pokemon-logo-style text-lg"
					style="background: var(--brand-red); color: white;">VS</div>

				<!-- Right team slot -->
				<div class="relative flex flex-col items-center justify-center p-10"
					style="background: linear-gradient(135deg, rgba(59,130,246,0.08), rgba(59,130,246,0.02));">
					<div class="w-24 h-24 pokeball-deco mb-4" style="opacity: 0.6; filter: hue-rotate(160deg);"></div>
					<p class="text-sm font-semibold theme-text-secondary">Opponent</p>
					<p class="text-xs theme-text-muted mt-1">Not ready</p>
				</div>
			</div>

			<!-- Action area -->
			<div class="px-8 py-6 text-center" style="background-color: var(--bg-secondary); border-top: 1px solid var(--border-color);">
				<p class="theme-text font-semibold mb-1">You need at least 2 teams to battle</p>
				<p class="theme-text-secondary text-sm mb-5">
					Head to the Team Builder, create two teams, then come back here.
				</p>
				<a href="/teams" class="btn btn-primary inline-flex items-center gap-2">
					<Users size={18} />
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
