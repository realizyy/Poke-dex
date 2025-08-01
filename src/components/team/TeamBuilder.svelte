<script lang="ts">
	import { onMount } from 'svelte';
	import { teamStore, currentTeam } from '$lib/stores/team';
	import type { Team, TeamPokemon, Pokemon } from '$lib/types';
	import { calculateTeamCoverage, getTypeColor } from '$lib/utils/pokemon-utils';
	import PokemonCard from '../ui/PokemonCard.svelte';

	export let team: Team;
	export let showAnalysis = true;
	export let allowEditing = true;
	export let pokemonSelector: any = undefined;

	let teamCoverage: ReturnType<typeof calculateTeamCoverage>;
	let showAddPokemon = false;

	$: if (team) {
		teamCoverage = calculateTeamCoverage(team.pokemons);
	}

	function removePokemon(index: number) {
		if (allowEditing) {
			teamStore.removePokemonFromTeam(team.id, index);
		}
	}

	function openAddPokemon() {
		showAddPokemon = true;
		currentTeam.set(team);
	}

	function getCoverageColor(count: number): string {
		if (count === 0) return 'text-green-700';
		if (count === 1) return 'text-yellow-700';
		if (count <= 2) return 'text-orange-700';
		if (count <= 3) return 'text-red-700';
		return 'text-red-800';
	}

	function getTeamScore(): { score: number; grade: string; color: string } {
		if (!teamCoverage) return { score: 0, grade: 'F', color: 'text-red-600' };

		const score = Math.max(0, 100 - teamCoverage.coverageScore * 10);
		let grade = 'F';
		let color = 'text-red-600';

		if (score >= 90) {
			grade = 'A';
			color = 'text-green-600';
		} else if (score >= 80) {
			grade = 'B';
			color = 'text-blue-600';
		} else if (score >= 70) {
			grade = 'C';
			color = 'text-yellow-600';
		} else if (score >= 60) {
			grade = 'D';
			color = 'text-orange-600';
		}

		return { score: Math.round(score), grade, color };
	}
</script>

<div
	class="rounded-xl theme-border theme-bg-secondary p-6 shadow-lg"
	style="border-color: var(--border-color); background-color: var(--bg-secondary);"
>
	<!-- Team Header -->
	<div class="mb-6 flex items-center justify-between">
		<div>
			<h2 class="text-2xl font-bold theme-text">{team.name}</h2>
			<p class="text-sm theme-text-secondary">
				{team.pokemons.length}/6 Pokémon
			</p>
		</div>

		{#if showAnalysis && teamCoverage}
			<div class="text-right">
				{#snippet teamScoreDisplay()}
					{@const teamScore = getTeamScore()}
					<div class="text-2xl font-bold {teamScore.color}">
						{teamScore.grade}
					</div>
					<div class="text-sm theme-text-secondary">
						Team Score: {teamScore.score}/100
					</div>
				{/snippet}
				{@render teamScoreDisplay()}
			</div>
		{/if}
	</div>

	<!-- Team Pokemon Grid -->
	<div class="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
		{#each Array(6) as _, index}
			{#if team.pokemons[index]}
				{@const teamPokemon = team.pokemons[index]}
				<div class="group relative">
					<PokemonCard pokemon={teamPokemon.pokemon} compact={true} />

					<!-- Pokemon Details with Remove Button -->
					<div class="mt-2 rounded-lg theme-bg-tertiary p-2 relative" style="background-color: var(--bg-tertiary);">
						<div class="flex items-start justify-between gap-2">
							<div class="flex-1 min-w-0">
								{#if teamPokemon.nickname}
									<div class="text-sm font-semibold theme-text truncate">
										{teamPokemon.nickname}
									</div>
								{/if}

								{#if teamPokemon.moves.length > 0}
									<div class="text-xs theme-text-secondary">
										Moves: {teamPokemon.moves.slice(0, 2).join(', ')}
										{#if teamPokemon.moves.length > 2}
											<span class="text-blue-600">+{teamPokemon.moves.length - 2} more</span>
										{/if}
									</div>
								{/if}
							</div>

							<!-- Compact Remove Button -->
							{#if allowEditing}
								<button
									on:click={() => removePokemon(index)}
									class="flex-shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500/80 text-white transition-all hover:bg-red-600 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-red-300"
									title="Remove from team"
									aria-label="Remove {teamPokemon.pokemon.name} from team"
								>
									<svg class="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											stroke-linecap="round"
											stroke-linejoin="round"
											stroke-width="2.5"
											d="M6 18L18 6M6 6l12 12"
										></path>
									</svg>
								</button>
							{/if}
						</div>
					</div>
				</div>
			{:else}
				<!-- Empty Slot -->
				<div
					class="flex min-h-[200px] flex-col items-center justify-center rounded-xl border-2 border-dashed theme-border p-8 theme-text-muted"
					style="border-color: var(--border-color);"
				>
					{#if allowEditing}
						<button
							on:click={openAddPokemon}
							class="flex flex-col items-center gap-2 transition-colors hover:text-blue-500"
						>
							<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								></path>
							</svg>
							<span class="text-sm">Add Pokémon</span>
						</button>
					{:else}
						<div class="text-center">
							<div class="mx-auto mb-2 h-8 w-8 opacity-50">
								<svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 12H4"
									></path>
								</svg>
							</div>
							<span class="text-sm">Empty Slot</span>
						</div>
					{/if}
				</div>
			{/if}
		{/each}
	</div>

	<!-- Team Analysis -->
	{#if showAnalysis && teamCoverage && team.pokemons.length > 0}
		<div class="border-t theme-border pt-6" style="border-color: var(--border-color);">
			<h3 class="mb-4 text-lg font-semibold theme-text">Team Analysis</h3>

			<div class="grid grid-cols-1 gap-6 md:grid-cols-2">
				<!-- Weaknesses -->
				<div>
					<h4 class="text-md mb-3 font-medium theme-text-secondary">Team Weaknesses</h4>
					{#if Object.keys(teamCoverage.weaknesses).length > 0}
						<div class="flex flex-wrap gap-2">
							{#each Object.entries(teamCoverage.weaknesses) as [type, count]}
								<span
									class="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-white capitalize"
									style="background-color: {getTypeColor(type)}"
								>
									{type}
									<span
										class="bg-white bg-opacity-90 rounded-full px-1.5 py-0.5 text-xs font-bold {getCoverageColor(count)}"
									>
										{count}
									</span>
								</span>
							{/each}
						</div>
					{:else}
						<p class="text-sm text-green-600 dark:text-green-400">
							No major type weaknesses detected!
						</p>
					{/if}
				</div>

				<!-- Resistances -->
				<div>
					<h4 class="text-md mb-3 font-medium theme-text-secondary">
						Team Resistances
					</h4>
					{#if Object.keys(teamCoverage.resistances).length > 0}
						<div class="flex flex-wrap gap-2">
							{#each Object.entries(teamCoverage.resistances) as [type, count]}
								<span
									class="flex items-center gap-1 rounded-full px-3 py-1 text-sm font-semibold text-white capitalize"
									style="background-color: {getTypeColor(type)}"
								>
									{type}
									<span class="bg-white bg-opacity-90 rounded-full px-1.5 py-0.5 text-xs font-bold text-green-700">
										{count}
									</span>
								</span>
							{/each}
						</div>
					{:else}
						<p class="text-sm theme-text-secondary">No resistances detected.</p>
					{/if}
				</div>
			</div>

			<!-- Recommendations -->
			<div class="mt-6 rounded-lg bg-blue-50 p-4 dark:bg-blue-900/20">
				<h4 class="text-md mb-2 font-medium text-blue-900 dark:text-blue-300">Recommendations</h4>
				<div class="text-sm text-blue-800 dark:text-blue-200">
					{#if team.pokemons.length < 6}
						<p>• Consider adding {6 - team.pokemons.length} more Pokémon to complete your team.</p>
					{/if}
					{#if teamCoverage.coverageScore > 5}
						<p>
							• Your team has some type weaknesses. Consider adding Pokémon that resist common
							offensive types.
						</p>
					{/if}
					{#if Object.keys(teamCoverage.resistances).length < 5}
						<p>• Try to diversify your team's type coverage for better defensive synergy.</p>
					{/if}
				</div>
			</div>
		</div>
	{/if}
</div>

<!-- Pokemon Selector Modal -->
{#if showAddPokemon}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div class="max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-xl theme-bg-secondary theme-border" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
			<div
				class="flex items-center justify-between border-b theme-border p-4"
				style="border-color: var(--border-color);"
			>
				<h3 class="text-lg font-semibold theme-text">
					Add Pokémon to {team.name}
				</h3>
				<button
					on:click={() => (showAddPokemon = false)}
					class="theme-text-muted hover:theme-text-secondary"
					aria-label="Close add Pokémon dialog"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						></path>
					</svg>
				</button>
			</div>
			<div class="overflow-y-auto p-4" style="max-height: calc(90vh - 80px);">
				{#if pokemonSelector}
					{@render pokemonSelector()}
				{/if}
			</div>
		</div>
	</div>
{/if}
