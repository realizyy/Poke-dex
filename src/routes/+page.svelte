<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Pokemon } from '$lib/types';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { getTypeColor } from '$lib/utils/pokemon-utils';
	import Header from '../components/header/header.svelte';

	let pokemons: Pokemon[] = [];
	let loading = true;
	let searchQuery = '';

	onMount(() => {
		const data = get(page).data;
		pokemons = data.pokemons;
		loading = false;
	});

	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	}
</script>

<div class="min-h-full p-4 md:p-8 lg:p-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-t-3xl">
	<Header title="Pokédex" />
	
	<!-- Quick Actions -->
	<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
		<a 
			href="/search" 
			class="block p-6 bg-blue-500 hover:bg-blue-600 rounded-xl text-white transition-colors group"
		>
			<div class="flex items-center gap-4">
				<svg class="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
				</svg>
				<div>
					<h3 class="text-lg font-semibold">Advanced Search</h3>
					<p class="text-blue-100 text-sm">Filter by type, generation, and stats</p>
				</div>
			</div>
		</a>
		
		<a 
			href="/teams" 
			class="block p-6 bg-green-500 hover:bg-green-600 rounded-xl text-white transition-colors group"
		>
			<div class="flex items-center gap-4">
				<svg class="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
				</svg>
				<div>
					<h3 class="text-lg font-semibold">Team Builder</h3>
					<p class="text-green-100 text-sm">Build teams with type coverage analysis</p>
				</div>
			</div>
		</a>
		
		<a 
			href="/battle" 
			class="block p-6 bg-red-500 hover:bg-red-600 rounded-xl text-white transition-colors group"
		>
			<div class="flex items-center gap-4">
				<svg class="w-8 h-8 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
				</svg>
				<div>
					<h3 class="text-lg font-semibold">Battle Simulator</h3>
					<p class="text-red-100 text-sm">Test your teams in battle</p>
				</div>
			</div>
		</a>
	</div>
	
	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
		</div>
	{:else}
		<div class="mb-6">
			<form on:submit|preventDefault={handleSearch} class="flex gap-2">
				<input
					type="text"
					placeholder="Search Pokémon by name..."
					bind:value={searchQuery}
					class="flex-1 p-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
				<button
					type="submit"
					class="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
				>
					Search
				</button>
			</form>
		</div>
		
		<h2 class="text-xl font-semibold text-gray-900 dark:text-white mb-4">Featured Pokémon</h2>
		<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each pokemons as pokemon}
				<a href="/pokemon/{pokemon.id}" class="block">
					<div class="rounded-xl p-4 transition-transform hover:scale-105 border-2 border-black/10 dark:border-white/10" style="background-color: {getTypeColor(pokemon.types[0].type.name)}">
						<div class="flex justify-between items-start mb-2">
							<div>
								<h2 class="text-white font-semibold capitalize">{pokemon.name}</h2>
								<div class="flex gap-2 mt-1">
									{#each pokemon.types as type}
										<span class="px-2 py-1 bg-white/20 text-white text-xs rounded-full font-medium">
											{type.type.name}
										</span>
									{/each}
								</div>
							</div>
							<span class="text-white/80 text-sm font-medium">#{pokemon.id.toString().padStart(3, '0')}</span>
						</div>
						<div class="flex justify-center">
							<img
								src={pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
								alt={pokemon.name}
								class="w-20 h-20 object-contain"
								loading="lazy"
							/>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>