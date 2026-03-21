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
			pokemons: team.pokemons.map(tp => ({
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
	<meta name="description" content="Build and manage your Pokémon teams with advanced type coverage analysis." />
</svelte:head>

<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
	<div class="grid grid-cols-1 lg:grid-cols-4 gap-8">
		<!-- Team List Sidebar -->
		<div class="lg:col-span-1">
			<div class="theme-bg-secondary rounded-xl shadow-lg p-6 theme-border" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
				<div class="flex justify-between items-center mb-4">
					<h2 class="text-xl font-bold theme-text">Your Teams</h2>
					<button
						onclick={() => showCreateModal = true}
						class="btn btn-primary btn-sm"
					>
						+ New
					</button>
				</div>
				
				{#if teamStore.teams.length === 0}
					<div class="text-center py-8">
						<Users size={48} class="mx-auto theme-text-muted mb-2" />
						<h3 class="mt-2 text-sm font-medium theme-text">No teams yet</h3>
						<p class="mt-1 text-sm theme-text-secondary">
							Create your first team to get started.
						</p>
					</div>
				{:else}
					<div class="space-y-2">
						{#each teamStore.teams as team}
							{@const typeColors = [...new Set(team.pokemons.flatMap(tp => tp.pokemon?.types?.map(t => t.type.name) ?? []))].slice(0, 6)}
							<div
								class="p-3 rounded-lg cursor-pointer transition-all"
								style="border: 1px solid var(--border-color); border-left: 4px solid {teamStore.currentTeam?.id === team.id ? 'var(--brand-red)' : 'transparent'}; background-color: {teamStore.currentTeam?.id === team.id ? 'var(--brand-red-muted)' : 'var(--bg-main)'};"
								onclick={() => selectTeam(team)}
								onkeydown={(e) => e.key === 'Enter' && selectTeam(team)}
								role="button"
								tabindex="0"
							>
								<div class="flex justify-between items-start">
									<div class="flex-1 min-w-0">
									<h3 class="font-semibold theme-text truncate text-sm">
										{team.name}
									</h3>
									<p class="text-xs theme-text-secondary">{team.pokemons.length}/6 Pokémon</p>
									{#if typeColors.length > 0}
										<div class="flex gap-1 mt-1.5">
											{#each typeColors as type}
												<span
													title={type}
													class="w-2.5 h-2.5 rounded-full border border-white/30 flex-shrink-0"
													style="background-color: {getTypeColor(type)};"
												></span>
											{/each}
										</div>
									{/if}
									</div>
									<div class="flex gap-1 ml-2">
										<button
											onclick={(e) => { e.stopPropagation(); exportTeam(team); }}
											class="btn btn-ghost btn-xs"
											title="Export team"
											aria-label="Export team"
										>
											<Download size={16} />
										</button>
										<button
											onclick={(e) => { e.stopPropagation(); deleteTeam(team.id); }}
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
					<div class="text-center py-8">
						<p class="theme-text-secondary mb-4">
							To add Pokémon, search the Pokédex and pick <em>Add to Team</em>.
						</p>
						<button onclick={() => goto('/search')} class="btn btn-primary">
							Open Pokédex Search
						</button>
					</div>
				{/snippet}
				<TeamBuilder team={teamStore.currentTeam} showAnalysis={true} allowEditing={true} {pokemonSelector} />
			{:else}
				<div class="rounded-xl shadow-lg p-10" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
					<div class="text-center max-w-sm mx-auto">
						<!-- Pokeball trio illustration -->
						<div class="flex justify-center items-end gap-3 mb-8">
							<div class="w-12 h-12 pokeball-deco" style="opacity: 0.3;"></div>
							<div class="w-16 h-16 pokeball-deco" style="opacity: 0.7;"></div>
							<div class="w-12 h-12 pokeball-deco" style="opacity: 0.3;"></div>
						</div>

						{#if teamStore.teams.length === 0}
							<h3 class="text-xl font-bold theme-text mb-2">Build Your First Team</h3>
							<p class="theme-text-secondary text-sm mb-6">Get started in three steps.</p>
							<ol class="text-left space-y-3 mb-8 rounded-xl p-5" style="background-color: var(--bg-tertiary);">
								<li class="flex items-start gap-3">
									<span class="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style="background: var(--brand-red);">1</span>
									<span class="text-sm theme-text-secondary">Click <strong class="theme-text">+ New</strong> to create a team.</span>
								</li>
								<li class="flex items-start gap-3">
									<span class="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style="background: var(--brand-red);">2</span>
									<span class="text-sm theme-text-secondary">Search the Pokédex and tap <strong class="theme-text">Add to Team</strong>.</span>
								</li>
								<li class="flex items-start gap-3">
									<span class="flex-shrink-0 w-6 h-6 rounded-full text-white text-xs font-bold flex items-center justify-center" style="background: var(--brand-red);">3</span>
									<span class="text-sm theme-text-secondary">Analyze coverage and battle your rivals.</span>
								</li>
							</ol>
							<button onclick={() => showCreateModal = true} class="btn btn-primary btn-lg">
								Create First Team
							</button>
						{:else}
							<h3 class="text-xl font-bold theme-text mb-2">Select a Team</h3>
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
	<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
		<div class="theme-bg-secondary rounded-xl max-w-md w-full p-6 theme-border" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
			<h3 class="text-lg font-semibold theme-text mb-4">
				Create New Team
			</h3>
			
			<form onsubmit={(e) => { e.preventDefault(); createTeam(); }}>
				<div class="mb-4">
					<label for="team-name-input" class="block text-sm font-medium theme-text-secondary mb-2">
						Team Name
					</label>
					<input
						id="team-name-input"
						type="text"
						bind:value={newTeamName}
						placeholder="Enter team name..."
						class="w-full px-3 py-2 rounded-lg theme-border theme-bg theme-text focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
						style="background-color: var(--bg-main); border-color: var(--border-color); color: var(--text-main);"
						required
					/>
				</div>
				
				<div class="flex justify-end gap-3">
					<button
						type="button"
						onclick={() => { showCreateModal = false; newTeamName = ''; }}
						class="btn btn-ghost"
					>
					Cancel
					</button>
					<button
						type="submit"
						class="btn btn-primary"
						disabled={!newTeamName.trim()}
					>
						Create Team
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
