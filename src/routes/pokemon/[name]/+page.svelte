<script lang="ts">
	   import { goto } from '$app/navigation';
	   import type { Pokemon, Team } from '$lib/types';
	   import { getTypeColor, getStatName, getStatColor } from '$lib/utils/pokemon-utils';
	   import { teamStore } from '$lib/stores/team';
	   import { onMount } from 'svelte';
	   import EvolutionChain from '../../../components/ui/EvolutionChain.svelte';
	   import { page } from '$app/stores';
	   import type { PageData } from './$types';

	   export let data: PageData;
	   const pokemon = data.pokemon;
	   let activeTab = 'About';
	   let teams: Team[] = [];

	   onMount(() => {
			   teamStore.loadTeams();
			   teamStore.subscribe((value: Team[]) => {
				   teams = value;
			   });
	   });

	   function addToTeam(teamId: string) {
			   if (pokemon) {
					   teamStore.addPokemonToTeam(teamId, pokemon);
			   }
	   }

	   function handleBack() {
			   // Check if there's history to go back to
			   if (window.history.length > 1) {
					   history.back();
			   } else {
					   // Fallback to home if no history
					   goto('/');
			   }
	   }

	   const tabs = ['About', 'Base Stats', 'Moves', 'Evolution'];
</script>

<svelte:head>
	<title>{pokemon ? `${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} - Pokédx` : 'Loading...'}</title>
	<meta name="description" content={pokemon ? `Detailed information about ${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} including stats, moves, and abilities.` : 'Loading Pokemon details...'} />
</svelte:head>

{#if !pokemon}
	<div class="flex h-screen items-center justify-center">
		<div class="text-center">
			<div class="h-12 w-12 animate-spin rounded-full border-b-2 border-gray-900 mx-auto mb-4"></div>
			<p class="text-gray-600">Loading Pokemon details...</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen theme-bg-main">
		<!-- Header with Pokemon Image -->
		<div class="relative {getTypeColor(pokemon.types[0].type.name)} rounded-b-3xl overflow-hidden">
			<!-- Background Decorations -->
			<div class="absolute inset-0 opacity-20">
				<div class="absolute top-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl"></div>
				<div class="absolute bottom-10 left-10 w-24 h-24 bg-white rounded-full blur-2xl"></div>
			</div>
			
			<!-- Header Content -->
			<div class="relative p-6 pb-0">
				<div class="flex items-center justify-between mb-6">
					<div class="flex items-center gap-4">
						<button on:click={handleBack} class="p-2 hover:bg-white/20 rounded-lg transition-colors" aria-label="Go back">
							<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 theme-text" fill="none" viewBox="0 0 24 24" stroke="currentColor">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
							</svg>
						</button>
						<h1 class="text-3xl font-bold capitalize theme-text">{pokemon.name}</h1>
					</div>
					<span class="text-lg font-bold theme-text">#{pokemon.id.toString().padStart(3, '0')}</span>
				</div>
				
				<!-- Types -->
				<div class="flex gap-2 mb-8">
					{#each pokemon.types as type}
						<span class="px-4 py-2 rounded-full theme-text text-sm font-medium capitalize"
							style="background-color: {getTypeColor(type.type.name)};">
							{type.type.name}
						</span>
					{/each}
				</div>
				
				<!-- Pokemon Image -->
				<div class="flex justify-center pb-18">
					<div class="relative">
						<img 
							src={pokemon.sprites.other['official-artwork'].front_default} 
							alt={pokemon.name}
							class="w-48 h-48 object-contain drop-shadow-2xl"
						/>
					</div>
				</div>
			</div>
		</div>
		
		<!-- Main Content -->
		<div class="theme-bg-main -mt-6 relative z-10 rounded-t-3xl min-h-screen">
			<!-- Tab Navigation -->
			<div class="flex border-b theme-border-color sticky top-0 theme-bg-main z-20 rounded-t-3xl">
				{#each tabs as tab}
					<button
						on:click={() => activeTab = tab}
						class="flex-1 py-4 px-6 text-center font-medium transition-colors border-b-2 {activeTab === tab ? 'border-blue-500 text-blue-500' : 'border-transparent theme-text-secondary hover:theme-text-main'}"
						style="border-color: {activeTab === tab ? '#3b82f6' : 'transparent'};"
					>
						{tab}
					</button>
				{/each}
			</div>
			
			<!-- Tab Content -->
			<div class="p-6">
				{#if activeTab === 'About'}
					<div class="space-y-6">
						<!-- Basic Info -->
						<div class="grid grid-cols-2 gap-4">
							<div class="theme-bg-secondary rounded-lg p-4">
								<h3 class="text-sm font-medium theme-text-secondary mb-2">Height</h3>
								<p class="text-2xl font-bold theme-text">{(pokemon.height / 10).toFixed(1)} m</p>
							</div>
							<div class="theme-bg-secondary rounded-lg p-4">
								<h3 class="text-sm font-medium theme-text-secondary mb-2">Weight</h3>
								<p class="text-2xl font-bold theme-text">{(pokemon.weight / 10).toFixed(1)} kg</p>
							</div>
						</div>
						
						<!-- Abilities -->
						<div class="theme-bg-secondary rounded-lg p-4">
							<h3 class="text-lg font-semibold theme-text mb-3">Abilities</h3>
							<div class="flex flex-wrap gap-2">
								{#each pokemon.abilities as ability}
									<span class="px-3 py-1 theme-bg-tertiary rounded-full text-sm theme-text capitalize">
										{ability.ability.name.replace('-', ' ')}
									</span>
								{/each}
							</div>
						</div>
						
						<!-- Base Experience -->
						<div class="theme-bg-secondary rounded-lg p-4">
							<h3 class="text-sm font-medium theme-text-secondary mb-2">Base Experience</h3>
							<p class="text-2xl font-bold theme-text">{pokemon.base_experience || 'N/A'}</p>
						</div>
						
						<!-- Add to Team Section -->
						{#if teams.length > 0}
							<div class="theme-bg-secondary rounded-lg p-4">
								<h3 class="text-lg font-semibold theme-text mb-3">Add to Team</h3>
								<div class="grid grid-cols-1 gap-2">
									{#each teams as team}
										<button
											on:click={() => addToTeam(team.id)}
											disabled={team.pokemons.length >= 6}
											class="p-3 text-left rounded-lg transition-colors {team.pokemons.length >= 6 ? 'theme-bg-tertiary theme-text-secondary cursor-not-allowed' : 'theme-bg-tertiary hover:theme-bg-quaternary theme-text'}"
										>
											<div class="flex justify-between items-center">
												<span class="font-medium">{team.name}</span>
												<span class="text-sm theme-text-secondary">
													{team.pokemons.length}/6
												</span>
											</div>
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{:else if activeTab === 'Base Stats'}
					<div class="space-y-4">
						<!-- Stats Grid 3x3 -->
						<div class="grid grid-cols-3 gap-4">
							{#each pokemon.stats as stat}
								<div class="theme-bg-secondary rounded-lg p-4">
									<div class="flex justify-between items-center mb-2">
										<span class="font-medium theme-text text-sm">{getStatName(stat.stat.name)}</span>
										<span class="font-bold theme-text">{stat.base_stat}</span>
									</div>
									<div class="w-full bg-gray-200 rounded-full h-2">
										<div 
											class="h-2 rounded-full {getStatColor(stat.base_stat)} transition-all duration-500"
											style="width: {Math.min(stat.base_stat / 200 * 100, 100)}%"
										></div>
									</div>
								</div>
							{/each}
						</div>
						
						<!-- Total Stats -->
						<div class="theme-bg-secondary rounded-lg p-4 border-2 border-blue-500/20">
							<div class="flex justify-between items-center">
								<span class="font-bold text-lg theme-text">Total</span>
								<span class="font-bold text-xl theme-text">
									{pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0)}
								</span>
							</div>
						</div>
					</div>
				{:else if activeTab === 'Moves'}
					<div class="space-y-4">
						<p class="theme-text-secondary mb-4">
							{pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)} can learn {pokemon.moves.length} moves.
						</p>
						<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
							{#each pokemon.moves as move}
								<div class="theme-bg-secondary rounded-lg p-3">
									<span class="text-sm theme-text capitalize">
										{move.move.name.replace('-', ' ')}
									</span>
								</div>
							{/each}
						</div>
					</div>
				{:else if activeTab === 'Evolution'}
					<EvolutionChain pokemonId={pokemon.id} />
				{/if}
			</div>
		</div>
	</div>
{/if}

<style>
	:global(.theme-bg-main) {
		background-color: var(--bg-main, #ffffff);
	}
	
	:global(.theme-bg-secondary) {
		background-color: var(--bg-secondary, #f8f9fa);
	}
	
	:global(.theme-bg-tertiary) {
		background-color: var(--bg-tertiary, #e9ecef);
	}
	
	:global(.theme-bg-quaternary) {
		background-color: var(--bg-quaternary, #dee2e6);
	}
	
	:global(.theme-text) {
		color: var(--text-main, #212529);
	}
	
	:global(.theme-text-secondary) {
		color: var(--text-secondary, #6c757d);
	}
	
	:global(.theme-border-color) {
		border-color: var(--border-color, #dee2e6);
	}
</style>
