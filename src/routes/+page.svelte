<script lang="ts">
	import { onMount } from 'svelte';
	import type { Pokemon } from '$lib/types';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import Header from '../components/header/header.svelte';

	let pokemons: Pokemon[] = [];
	let loading = true;

	onMount(() => {
		const data = get(page).data;
		pokemons = data.pokemons;
		loading = false;
	});

	function getTypeColor(type: string): string {
		const colors: { [key: string]: string } = {
			grass: 'bg-emerald-400',
			fire: 'bg-red-400',
			water: 'bg-blue-400',
			electric: 'bg-yellow-400',
			normal: 'bg-gray-400',
		};
		return colors[type] || 'bg-gray-400';
	}
</script>

<div class="min-h-screen p-4 md:p-8 lg:p-12 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-t-3xl">
	<Header title="Pokédex" />
	{#if loading}
		<div class="flex justify-center items-center h-64">
			<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-gray-100"></div>
		</div>
	{:else}
		<div class="mb-4">
			<input
				type="text"
				placeholder="Search Pokémon"
				class="w-full p-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring focus:ring-blue-400 dark:focus:ring-blue-600"
			/>
		</div>
		<div class="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
			{#each pokemons as pokemon}
				<a href="/pokemon/{pokemon.id}" class="block">
					<div class="rounded-xl p-4 {getTypeColor(pokemon.types[0].type.name)} transition-transform hover:scale-105 border-2 border-black/10 dark:border-white/10">
						<div class="flex justify-between items-start mb-2">
							<div>
								<h2 class="text-white font-semibold capitalize">{pokemon.name}</h2>
								<div class="flex gap-2 mt-1">
									{#each pokemon.types as { type }}
                    <span class="text-xs text-white px-2 py-1 rounded-full bg-white/20 capitalize">
                      {type.name}
                    </span>
									{/each}
								</div>
							</div>
							<span class="text-white/60 text-sm">#{pokemon.id.toString().padStart(4, '0')}</span>
						</div>
						<div class="relative h-24">
							<img
								src={pokemon.sprites.other['official-artwork'].front_default || "/placeholder.svg"}
								alt={pokemon.name}
								class="absolute bottom-0 right-0 h-28 w-28 -mb-2 -mr-2"
							/>
						</div>
					</div>
				</a>
			{/each}
		</div>
	{/if}
</div>