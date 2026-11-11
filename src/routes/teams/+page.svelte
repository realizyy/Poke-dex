<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { teamStore } from '$lib/stores/team.svelte';
	import type { Team } from '$lib/types';
	import { Download, Trash2, Users } from '$lib/icons';
	import TeamBuilder from '../../components/team/TeamBuilder.svelte';
	import { getTypeColor } from '$lib/utils/pokemon-utils';

	let showCreateModal = $state(false);
	let newTeamName = $state('');

	onMount(() => {
		teamStore.loadTeams();
	});

	function createTeam() {
		if (newTeamName.trim()) {
			const team = teamStore.createTeam(newTeamName.trim());
			newTeamName = '';
			showCreateModal = false;
			teamStore.selectTeam(team);
		}
	}

	function deleteTeam(teamId: string) {
		if (confirm('Are you sure you want to delete this team?')) {
			teamStore.deleteTeam(teamId);
		}
	}

	function selectTeam(team: Team) {
		teamStore.selectTeam(team);
	}

	function exportTeam(team: Team) {
		const teamData = {
			name: team.name,
			pokemons: team.pokemons.map((tp) => ({
				name: tp.pokemon.name,
				id: tp.pokemon.id,
				nickname: tp.nickname,
				moves: tp.moves
			}))
		};

		const blob = new Blob([JSON.stringify(teamData, null, 2)], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const a = document.createElement('a');
		a.href = url;
		a.download = `${team.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_team.json`;
		a.click();
		URL.revokeObjectURL(url);
	}
</script>

<svelte:head>
	<title>Team Builder - Pokédex</title>
	<meta
		name="description"
		content="Build and manage your Pokémon teams with advanced type coverage analysis."
	/>
</svelte:head>

<div class="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
	<div class="grid grid-cols-1 gap-8 lg:grid-cols-4">
		<!-- Team List Sidebar -->
		<div class="lg:col-span-1">
			<div
				class="theme-bg-secondary theme-border rounded-xl p-6 shadow-lg"
				style="background-color: var(--bg-secondary); border-color: var(--border-color);"
			>
				<div class="mb-4 flex items-center justify-between">
					<h2 class="theme-text text-xl font-bold">Your Teams</h2>
					<button onclick={() => (showCreateModal = true)} class="btn btn-primary btn-sm">
						+ New
					</button>
				</div>

				{#if teamStore.teams.length === 0}
					<div class="py-8 text-center">
						<Users size={48} class="theme-text-muted mx-auto mb-2" />
						<h3 class="theme-text mt-2 text-sm font-medium">No teams yet</h3>
						<p class="theme-text-secondary mt-1 text-sm">Create your first team to get started.</p>
					</div>
				{:else}
					<div class="space-y-2">
						{#each teamStore.teams as team}
							{@const typeColors = [
								...new Set(
									team.pokemons.flatMap((tp) => tp.pokemon?.types?.map((t) => t.type.name) ?? [])
								)
							].slice(0, 6)}
							<div
								class="cursor-pointer rounded-lg p-3 transition-all"
								style="border: 1px solid var(--border-color); border-left: 4px solid {teamStore
									.currentTeam?.id === team.id
									? 'var(--brand-red)'
									: 'transparent'}; background-color: {teamStore.currentTeam?.id === team.id
									? 'var(--brand-red-muted)'
									: 'var(--bg-main)'};"
								onclick={() => selectTeam(team)}
								onkeydown={(e) => e.key === 'Enter' && selectTeam(team)}
								role="button"
								tabindex="0"
							>
								<div class="flex items-start justify-between">
									<div class="min-w-0 flex-1">
										<h3 class="theme-text truncate text-sm font-semibold">
											{team.name}
										</h3>
										<p class="theme-text-secondary text-xs">{team.pokemons.length}/6 Pokémon</p>
										{#if typeColors.length > 0}
											<div class="mt-1.5 flex gap-1">
												{#each typeColors as type}
													<span
														title={type}
														class="h-2.5 w-2.5 flex-shrink-0 rounded-full border border-white/30"
														style="background-color: {getTypeColor(type)};"
													></span>
												{/each}
											</div>
										{/if}
									</div>
									<div class="ml-2 flex gap-1">
										<button
											onclick={(e) => {
												e.stopPropagation();
												exportTeam(team);
											}}
											class="btn btn-ghost btn-xs"
											title="Export team"
											aria-label="Export team"
										>
											<Download size={16} />
										</button>
										<button
											onclick={(e) => {
												e.stopPropagation();
												deleteTeam(team.id);
											}}
											class="btn btn-ghost btn-xs text-error"
											title="Delete team"
											aria-label="Delete team"
										>
											<Trash2 size={16} />
										</button>
									</div>
								</div>
							</div>
						{/each}
					</div>
				{/if}
			</div>
		</div>

		<!-- Team Details -->
		<div class="lg:col-span-3">
			{#if teamStore.currentTeam}
				{#snippet pokemonSelector()}
					<div class="py-8 text-center">
						<p class="theme-text-secondary mb-4">
							To add Pokémon, search the Pokédex and pick <em>Add to Team</em>.
						</p>
						<button onclick={() => goto('/search')} class="btn btn-primary">
							Open Pokédex Search
						</button>
					</div>
				{/snippet}
				<TeamBuilder
					team={teamStore.currentTeam}
					showAnalysis={true}
					allowEditing={true}
					{pokemonSelector}
				/>
			{:else}
				<div
					class="rounded-xl p-10 shadow-lg"
					style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
				>
					<div class="mx-auto max-w-sm text-center">
						<!-- Pokeball trio illustration -->
						<div class="mb-8 flex items-end justify-center gap-3">
							<div class="pokeball-deco h-12 w-12" style="opacity: 0.3;"></div>
							<div class="pokeball-deco h-16 w-16" style="opacity: 0.7;"></div>
							<div class="pokeball-deco h-12 w-12" style="opacity: 0.3;"></div>
						</div>

						{#if teamStore.teams.length === 0}
							<h3 class="theme-text mb-2 text-xl font-bold">Build Your First Team</h3>
							<p class="theme-text-secondary mb-6 text-sm">Get started in three steps.</p>
							<ol
								class="mb-8 space-y-3 rounded-xl p-5 text-left"
								style="background-color: var(--bg-tertiary);"
							>
								<li class="flex items-start gap-3">
									<span
										class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
										style="background: var(--brand-red);">1</span
									>
									<span class="theme-text-secondary text-sm"
										>Click <strong class="theme-text">+ New</strong> to create a team.</span
									>
								</li>
								<li class="flex items-start gap-3">
									<span
										class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
										style="background: var(--brand-red);">2</span
									>
									<span class="theme-text-secondary text-sm"
										>Search the Pokédex and tap <strong class="theme-text">Add to Team</strong
										>.</span
									>
								</li>
								<li class="flex items-start gap-3">
									<span
										class="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
										style="background: var(--brand-red);">3</span
									>
									<span class="theme-text-secondary text-sm"
										>Analyze coverage and battle your rivals.</span
									>
								</li>
							</ol>
							<button onclick={() => (showCreateModal = true)} class="btn btn-primary btn-lg">
								Create First Team
							</button>
						{:else}
							<h3 class="theme-text mb-2 text-xl font-bold">Select a Team</h3>
							<p class="theme-text-secondary text-sm">
								Pick a team from the list on the left to view and edit your squad.
							</p>
						{/if}
					</div>
				</div>
			{/if}
		</div>
	</div>
</div>

<!-- Create Team Modal -->
{#if showCreateModal}
	<div class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4">
		<div
			class="theme-bg-secondary theme-border w-full max-w-md rounded-xl p-6"
			style="background-color: var(--bg-secondary); border-color: var(--border-color);"
		>
			<h3 class="theme-text mb-4 text-lg font-semibold">Create New Team</h3>

			<form
				onsubmit={(e) => {
					e.preventDefault();
					createTeam();
				}}
			>
				<div class="mb-4">
					<label for="team-name-input" class="theme-text-secondary mb-2 block text-sm font-medium">
						Team Name
					</label>
					<input
						id="team-name-input"
						type="text"
						bind:value={newTeamName}
						placeholder="Enter team name..."
						class="theme-border theme-bg theme-text w-full rounded-lg px-3 py-2 focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-none"
						style="background-color: var(--bg-main); border-color: var(--border-color); color: var(--text-main);"
						required
					/>
				</div>

				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={() => {
							showCreateModal = false;
							newTeamName = '';
						}}
						class="btn btn-ghost"
					>
						Cancel
					</button>
					<button type="submit" class="btn btn-primary" disabled={!newTeamName.trim()}>
						Create Team
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
