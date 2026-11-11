<script lang="ts">
	import type { Pokemon, TeamSelectedEvent } from '#lib/types';
	import { teamStore } from '#lib/stores/team.svelte';
	import { modalStore } from '#lib/stores/modal.svelte';
	import { getTypeColor } from '#lib/utils/pokemon-utils';
	import { X, Plus, ChevronLeft } from '#lib/icons';

	let {
		pokemon,
		show = $bindable(false),
		onclose,
		onteamselected
	}: {
		pokemon: Pokemon;
		show?: boolean;
		onclose?: () => void;
		onteamselected?: (event: TeamSelectedEvent) => void;
	} = $props();

	let createNewTeam = $state(false);
	let newTeamName = $state('');
	let selectedTeamId = $state('');

	$effect(() => {
		if (show) resetModalState();
	});

	const availableTeams = $derived(teamStore.teams.filter((team) => team.pokemons.length < 6));

	function resetModalState() {
		createNewTeam = false;
		newTeamName = '';
		selectedTeamId = '';
	}

	function handleClose() {
		modalStore.closeAddToTeamModal();
		onclose?.();
	}

	function handleCreateTeam() {
		if (newTeamName.trim()) {
			const newTeam = teamStore.createTeam(newTeamName.trim());
			selectedTeamId = newTeam.id;
			createNewTeam = false;
			newTeamName = '';
		}
	}

	function handleAddToTeam() {
		if (selectedTeamId && pokemon) {
			teamStore.addPokemonToTeam(selectedTeamId, pokemon);
			onteamselected?.({ teamId: selectedTeamId, pokemon });
			handleClose();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) handleClose();
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') handleClose();
		if (event.key === 'Enter' && createNewTeam && newTeamName.trim()) handleCreateTeam();
	}
</script>

{#if show}
	<!-- Modal Backdrop -->
	<div
		class="bg-opacity-50 fixed inset-0 z-50 flex items-center justify-center bg-black p-4"
		onclick={handleBackdropClick}
		onkeydown={handleKeydown}
		role="presentation"
	>
		<!-- Modal Content -->
		<div
			class="theme-bg-secondary theme-border max-h-[90vh] w-full max-w-md overflow-hidden rounded-xl shadow-2xl"
			style="background-color: var(--bg-secondary); border-color: var(--border-color);"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<!-- Modal Header -->
			<div
				class="theme-border-b flex items-center justify-between p-6"
				style="border-color: var(--border-color);"
			>
				<div class="flex items-center gap-3">
					<img
						src={pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
						alt={pokemon.name}
						class="h-12 w-12 object-contain"
						width="48"
						height="48"
						loading="lazy"
					/>
					<div>
						<h2 id="modal-title" class="theme-text text-lg font-bold capitalize">
							Add {pokemon.name} to Team
						</h2>
						<div class="mt-1 flex gap-1">
							{#each pokemon.types as type}
								<span
									class="rounded-full px-2 py-0.5 text-xs font-semibold text-white"
									style="background-color: {getTypeColor(type.type.name)}"
								>
									{type.type.name}
								</span>
							{/each}
						</div>
					</div>
				</div>
				<button
					onclick={handleClose}
					class="btn btn-ghost btn-sm btn-circle"
					aria-label="Close modal"
				>
					<X size={18} />
				</button>
			</div>

			<!-- Modal Body -->
			<div class="max-h-[60vh] space-y-4 overflow-y-auto p-6">
				{#if !createNewTeam}
					<!-- Team Selection -->
					<div class="space-y-3">
						<h3 class="theme-text text-sm font-semibold">Select Team:</h3>

						{#if availableTeams.length === 0}
							<div class="py-6 text-center">
								<Plus size={40} class="theme-text-secondary mx-auto mb-2" />
								<p class="theme-text-secondary mt-2 text-sm">
									No teams available or all teams are full
								</p>
								<p class="theme-text-muted text-xs">Create a new team to add this PokÃ©mon</p>
							</div>
						{:else}
							<div class="space-y-2">
								{#each availableTeams as team}
									<label
										class="theme-border hover:theme-bg-tertiary flex cursor-pointer items-center gap-3 rounded-lg p-3 transition-colors"
										style="border-color: var(--border-color);"
									>
										<input
											type="radio"
											bind:group={selectedTeamId}
											value={team.id}
											class="radio radio-primary"
										/>
										<div class="flex-1">
											<div class="theme-text font-medium">{team.name}</div>
											<div class="theme-text-secondary text-sm">
												{team.pokemons.length}/6 PokÃ©mon
											</div>
										</div>
									</label>
								{/each}
							</div>
						{/if}

						<!-- Create New Team Button -->
						<button
							onclick={() => (createNewTeam = true)}
							class="btn btn-outline btn-sm w-full gap-2"
						>
							<Plus size={14} />
							Create New Team
						</button>
					</div>
				{:else}
					<!-- Create New Team Form -->
					<div class="space-y-3">
						<div class="flex items-center gap-2">
							<button
								onclick={() => {
									createNewTeam = false;
									newTeamName = '';
								}}
								class="btn btn-ghost btn-xs btn-circle"
								aria-label="Back to team selection"
							>
								<ChevronLeft size={16} />
							</button>
							<h3 class="theme-text text-sm font-semibold">Create New Team:</h3>
						</div>

						<div class="space-y-3">
							<div>
								<label for="team-name" class="theme-text mb-1 block text-sm font-medium"
									>Team Name</label
								>
								<input
									id="team-name"
									type="text"
									bind:value={newTeamName}
									placeholder="Enter team name..."
									class="input input-bordered w-full"
									style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
									maxlength="50"
									onkeydown={(e) => e.key === 'Enter' && handleCreateTeam()}
								/>
							</div>

							<button
								onclick={handleCreateTeam}
								disabled={!newTeamName.trim()}
								class="btn btn-success w-full"
							>
								Create Team
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			{#if !createNewTeam}
				<div class="theme-border-t flex gap-3 p-6" style="border-color: var(--border-color);">
					<button onclick={handleClose} class="btn btn-ghost flex-1">Cancel</button>
					<button
						onclick={handleAddToTeam}
						disabled={!selectedTeamId}
						class="btn btn-primary flex-1"
					>
						Add to Team
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}
