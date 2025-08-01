<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { teamStore, currentTeam } from '$lib/stores/team';
	import type { Team } from '$lib/types';
	import TeamBuilder from '../../components/team/TeamBuilder.svelte';
	
	let teams: Team[] = [];
	let showCreateModal = false;
	let newTeamName = '';
	let selectedTeam: Team | null = null;
	let showPokemonSelector = false;
	
	// Subscribe to team store
	teamStore.subscribe((value: Team[]) => {
		teams = value;
		
		// Update selectedTeam if it exists in the updated teams
		if (selectedTeam) {
			const updatedSelectedTeam = value.find(team => team.id === selectedTeam!.id);
			if (updatedSelectedTeam) {
				selectedTeam = updatedSelectedTeam;
			} else {
				// Team was deleted, clear selection
				selectedTeam = null;
			}
		}
	});
	
	onMount(() => {
		teamStore.loadTeams();
	});
	
	function createTeam() {
		if (newTeamName.trim()) {
			const team = teamStore.createTeam(newTeamName.trim());
			newTeamName = '';
			showCreateModal = false;
			selectedTeam = team;
		}
	}
	
	function deleteTeam(teamId: string) {
		if (confirm('Are you sure you want to delete this team?')) {
			teamStore.deleteTeam(teamId);
			if (selectedTeam?.id === teamId) {
				selectedTeam = null;
			}
		}
	}
	
	function selectTeam(team: Team) {
		selectedTeam = team;
		currentTeam.set(team);
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
						on:click={() => showCreateModal = true}
						class="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
					>
						New Team
					</button>
				</div>
				
				{#if teams.length === 0}
					<div class="text-center py-8">
						<svg class="mx-auto h-12 w-12 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
						</svg>
						<h3 class="mt-2 text-sm font-medium theme-text">No teams yet</h3>
						<p class="mt-1 text-sm theme-text-secondary">
							Create your first team to get started.
						</p>
					</div>
				{:else}
					<div class="space-y-3">
						{#each teams as team}
							<div 
								class="p-3 rounded-lg border-2 cursor-pointer transition-all {selectedTeam?.id === team.id 
									? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
									: 'theme-border hover:border-blue-300 dark:hover:border-blue-500'}"
								style="{selectedTeam?.id === team.id 
									? 'border-color: #3b82f6; background-color: rgba(59, 130, 246, 0.1);' 
									: 'border-color: var(--border-color);'}"
								on:click={() => selectTeam(team)}
								on:keydown={(e) => e.key === 'Enter' && selectTeam(team)}
								role="button"
								tabindex="0"
							>
								<div class="flex justify-between items-start">
									<div class="flex-1 min-w-0">
										<h3 class="font-semibold theme-text truncate">
											{team.name}
										</h3>
										<p class="text-sm theme-text-secondary">
											{team.pokemons.length}/6 Pokémon
										</p>
									</div>
									<div class="flex gap-1 ml-2">
										<button
											on:click|stopPropagation={() => exportTeam(team)}
											class="p-1 theme-text-muted hover:text-blue-500 transition-colors"
											title="Export team"
                                            aria-label="Export team"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
											</svg>
										</button>
										<button
											on:click|stopPropagation={() => deleteTeam(team.id)}
											class="p-1 theme-text-muted hover:text-red-500 transition-colors"
											title="Delete team"
                                            aria-label="Delete team"
										>
											<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
											</svg>
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
			{#if selectedTeam}
				{#snippet pokemonSelector()}
					<div>
						<div class="text-center py-8">
							<p class="theme-text-secondary mb-4">
								To add Pokémon to your team, use the 
								<a href="/search" class="text-blue-500 hover:text-blue-600 font-medium">Advanced Search</a>
								page and select this team from the dropdown.
							</p>
							<button
								on:click={() => goto('/search')}
								class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
							>
								Go to Search
							</button>
						</div>
					</div>
				{/snippet}
				<TeamBuilder team={selectedTeam} showAnalysis={true} allowEditing={true} {pokemonSelector} />
			{:else}
				<div class="theme-bg-secondary rounded-xl shadow-lg p-12 theme-border" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
					<div class="text-center">
						<svg class="mx-auto h-16 w-16 theme-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
						</svg>
						<h3 class="mt-4 text-xl font-medium theme-text">Select a Team</h3>
                        {#if teams.length === 0}
                            <p class="mt-2 theme-text-secondary">
                                You have no teams yet. Create one to get started.
                            </p>
                        {:else}
                            <p class="mt-2 theme-text-secondary">
                                Select a team from the list on the left to view or edit its details.
                            </p>
                            <p class="mt-2 theme-text-muted">
                                You can also create a new team using the button above.
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
			
			<form on:submit|preventDefault={createTeam}>
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
						on:click={() => { showCreateModal = false; newTeamName = ''; }}
						class="px-4 py-2 theme-text-secondary hover:theme-bg-tertiary rounded-lg transition-colors"
						style="color: var(--text-secondary);"
					>
						Cancel
					</button>
					<button
						type="submit"
						class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
						disabled={!newTeamName.trim()}
					>
						Create Team
					</button>
				</div>
			</form>
		</div>
	</div>
{/if}
