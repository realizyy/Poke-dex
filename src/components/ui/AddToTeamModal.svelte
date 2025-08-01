<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { Pokemon, Team, TeamSelectedEvent } from '$lib/types';
	import { teamStore } from '$lib/stores/team';
	import { modalStore } from '$lib/stores/modal';
	import { getTypeColor } from '$lib/utils/pokemon-utils';

	const dispatch = createEventDispatcher<{
		close: void;
		teamSelected: TeamSelectedEvent;
	}>();

	export let pokemon: Pokemon;
	export let teams: Team[] = [];
	export let show = false;

	let createNewTeam = false;
	let newTeamName = '';
	let selectedTeamId = '';

	// Reset state when modal opens/closes
	$: if (show) {
		resetModalState();
	}

	function resetModalState() {
		createNewTeam = false;
		newTeamName = '';
		selectedTeamId = '';
	}

	function handleClose() {
		modalStore.closeAddToTeamModal();
		dispatch('close');
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
			dispatch('teamSelected', { teamId: selectedTeamId, pokemon });
			handleClose();
		}
	}

	function handleBackdropClick(event: MouseEvent) {
		if (event.target === event.currentTarget) {
			handleClose();
		}
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			handleClose();
		}
		if (event.key === 'Enter' && createNewTeam && newTeamName.trim()) {
			handleCreateTeam();
		}
	}

	$: availableTeams = teams.filter(team => team.pokemons.length < 6);
</script>

{#if show}
	<!-- Modal Backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
		on:click={handleBackdropClick}
		on:keydown={handleKeydown}
		role="presentation"
	>
		<!-- Modal Content -->
		<div 
			class="theme-bg-secondary rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden theme-border"
			style="background-color: var(--bg-secondary); border-color: var(--border-color);"
			role="dialog"
			aria-modal="true"
			aria-labelledby="modal-title"
		>
			<!-- Modal Header -->
			<div class="flex items-center justify-between p-6 theme-border-b" style="border-color: var(--border-color);">
				<div class="flex items-center gap-3">
					<img
						src={pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
						alt={pokemon.name}
						class="w-12 h-12 object-contain"
					/>
					<div>
						<h2 id="modal-title" class="text-lg font-bold theme-text capitalize">
							Tambah {pokemon.name} ke Tim
						</h2>
						<div class="flex gap-1 mt-1">
							{#each pokemon.types as type}
								<span
									class="px-2 py-0.5 rounded-full text-xs font-semibold text-white"
									style="background-color: {getTypeColor(type.type.name)}"
								>
									{type.type.name}
								</span>
							{/each}
						</div>
					</div>
				</div>
				<button
					on:click={handleClose}
					class="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
					aria-label="Tutup modal"
				>
					<svg class="w-5 h-5 theme-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
					</svg>
				</button>
			</div>

			<!-- Modal Body -->
			<div class="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
				{#if !createNewTeam}
					<!-- Team Selection -->
					<div class="space-y-3">
						<h3 class="text-sm font-semibold theme-text">Pilih Tim:</h3>
						
						{#if availableTeams.length === 0}
							<div class="text-center py-6">
								<svg class="mx-auto h-10 w-10 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
								</svg>
								<p class="mt-2 text-sm theme-text-secondary">
									Tidak ada tim yang tersedia atau semua tim sudah penuh
								</p>
								<p class="text-xs theme-text-muted">
									Buat tim baru untuk menambahkan Pokémon ini
								</p>
							</div>
						{:else}
							<div class="space-y-2">
								{#each availableTeams as team}
									<label class="flex items-center gap-3 p-3 rounded-lg theme-border hover:theme-bg-tertiary transition-colors cursor-pointer"
										style="border-color: var(--border-color);">
										<input
											type="radio"
											bind:group={selectedTeamId}
											value={team.id}
											class="text-blue-600 focus:ring-blue-500"
										/>
										<div class="flex-1">
											<div class="font-medium theme-text">{team.name}</div>
											<div class="text-sm theme-text-secondary">
												{team.pokemons.length}/6 Pokémon
											</div>
										</div>
									</label>
								{/each}
							</div>
						{/if}

						<!-- Create New Team Button -->
						<button
							on:click={() => createNewTeam = true}
							class="w-full flex items-center justify-center gap-2 p-3 border-2 border-dashed theme-border theme-text-secondary hover:theme-bg-tertiary transition-colors rounded-lg"
							style="border-color: var(--border-color);"
						>
							<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
							</svg>
							Buat Tim Baru
						</button>
					</div>
				{:else}
					<!-- Create New Team Form -->
					<div class="space-y-3">
						<div class="flex items-center gap-2">
												<button
						on:click={() => { createNewTeam = false; newTeamName = ''; }}
						class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
						aria-label="Kembali ke pilihan tim"
					>
						<svg class="w-4 h-4 theme-text" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path>
						</svg>
					</button>
							<h3 class="text-sm font-semibold theme-text">Buat Tim Baru:</h3>
						</div>
						
						<div class="space-y-3">
							<div>
								<label for="team-name" class="block text-sm font-medium theme-text mb-1">
									Nama Tim
								</label>
								<input
									id="team-name"
									type="text"
									bind:value={newTeamName}
									placeholder="Masukkan nama tim..."
									class="w-full px-3 py-2 rounded-lg theme-border theme-bg-secondary theme-text focus:outline-none focus:ring-2 focus:ring-blue-500"
									style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
									maxlength="50"
									on:keydown={(e) => e.key === 'Enter' && handleCreateTeam()}
								/>
							</div>
							
							<button
								on:click={handleCreateTeam}
								disabled={!newTeamName.trim()}
								class="w-full px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
							>
								Buat Tim
							</button>
						</div>
					</div>
				{/if}
			</div>

			<!-- Modal Footer -->
			{#if !createNewTeam}
				<div class="flex gap-3 p-6 theme-border-t" style="border-color: var(--border-color);">
					<button
						on:click={handleClose}
						class="flex-1 px-4 py-2 theme-border theme-text hover:theme-bg-tertiary rounded-lg font-medium transition-colors"
						style="border-color: var(--border-color);"
					>
						Batal
					</button>
					<button
						on:click={handleAddToTeam}
						disabled={!selectedTeamId}
						class="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
					>
						Tambahkan
					</button>
				</div>
			{/if}
		</div>
	</div>
{/if}