<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Pokemon } from '$lib/types';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { getTypeColor } from '$lib/utils/pokemon-utils';
	import LoadingSpinner from '../components/ui/LoadingSpinner.svelte';

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

<svelte:head>
	<title>Pokédex - Explore the World of Pokémon</title>
	<meta name="description" content="Discover, analyze, and build teams with your favorite Pokémon. Access detailed stats, type coverage, and battle simulations." />
</svelte:head>

<main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
	<div class="text-center mb-12">
		<h1 class="text-4xl md:text-6xl font-bold mb-4">
			<span class="bg-gradient-to-r from-blue-600 via-purple-600 to-red-600 bg-clip-text text-transparent">
				Explore the World
			</span>
		</h1>
		<h2 class="text-3xl md:text-5xl font-bold mb-6">
				<span class="theme-text-secondary mr-4">of</span>
				<span class="relative inline-block">
					<span class="pokemon-logo-style text-5xl md:text-6xl lg:text-7xl">
						Pokémon
					</span>
				</span>
			</h2>
			<p class="text-lg theme-text-secondary max-w-2xl mx-auto">
				Discover, analyze, and build teams with your favorite Pokémon. Access detailed stats, type coverage, and battle simulations.
			</p>
		</div>
		
		<!-- Quick Search -->
		<div class="max-w-2xl mx-auto mb-12">
			<form on:submit|preventDefault={handleSearch} class="relative">
				<div class="relative">
					<input
						type="text"
						placeholder="Search for any Pokémon..."
						bind:value={searchQuery}
						class="w-full pl-12 pr-32 py-4 rounded-2xl theme-border theme-bg-secondary backdrop-blur-xl theme-text theme-placeholder focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-lg transition-all duration-200"
						style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
					/>
					<div class="absolute left-4 top-1/2 transform -translate-y-1/2">
						<svg class="w-5 h-5 theme-text-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
					<button
						type="submit"
						class="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl"
					>
						Search
					</button>
				</div>
			</form>
		</div>
		
		<!-- Quick Actions -->
		<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
			<a 
				href="/search" 
				class="group block p-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 theme-bg-secondary theme-border"
				style="background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary)); border: 1px solid var(--border-color);"
			>
				<div class="flex items-center gap-4 mb-4">
					<div class="p-3 bg-blue-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
						<svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-xl font-bold theme-text">Advanced Search</h3>
						<p class="theme-text-secondary text-sm opacity-90">Filter by type, generation, and stats</p>
					</div>
				</div>
				<div class="flex items-center text-sm font-medium text-blue-600">
					<span>Explore filters</span>
					<svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				</div>
			</a>
			
			<a 
				href="/teams" 
				class="group block p-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 theme-bg-secondary theme-border"
				style="background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary)); border: 1px solid var(--border-color);"
			>
				<div class="flex items-center gap-4 mb-4">
					<div class="p-3 bg-green-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
						<svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-xl font-bold theme-text">Team Builder</h3>
						<p class="theme-text-secondary text-sm opacity-90">Build teams with type coverage analysis</p>
					</div>
				</div>
				<div class="flex items-center text-sm font-medium text-green-600">
					<span>Start building</span>
					<svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				</div>
			</a>
			
			<a 
				href="/battle" 
				class="group block p-8 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl transform hover:-translate-y-1 theme-bg-secondary theme-border"
				style="background: linear-gradient(135deg, var(--bg-secondary), var(--bg-tertiary)); border: 1px solid var(--border-color);"
			>
				<div class="flex items-center gap-4 mb-4">
					<div class="p-3 bg-red-500/20 rounded-xl group-hover:scale-110 transition-transform duration-300">
						<svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
						</svg>
					</div>
					<div>
						<h3 class="text-xl font-bold theme-text">Battle Simulator</h3>
						<p class="theme-text-secondary text-sm opacity-90">Test your teams in battle</p>
					</div>
				</div>
				<div class="flex items-center text-sm font-medium text-red-600">
					<span>Enter battle</span>
					<svg class="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
					</svg>
				</div>
			</a>
		</div>
		
		<!-- Featured Pokémon Section -->
		{#if loading}
			<div class="flex justify-center items-center h-64">
				<LoadingSpinner 
					size="lg" 
					text="Loading..." 
					showText={true}
				/>
			</div>
		{:else}
			<section>
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-3xl font-bold theme-text">Featured Pokémon</h2>
					<a 
						href="/search" 
						class="flex items-center text-blue-600 hover:text-blue-700 font-medium transition-colors"
					>
						View all
						<svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
						</svg>
					</a>
				</div>
				
				<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
					{#each pokemons as pokemon}
						<a href="/pokemon/{pokemon.name}" class="group block">
							<div class="relative overflow-hidden rounded-2xl transition-all duration-300 group-hover:scale-105 group-hover:shadow-2xl theme-border" style="background-color: {getTypeColor(pokemon.types[0].type.name)}cc; border-color: var(--border-color);">
								<!-- Decorative elements -->
								<div class="absolute top-4 right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
								<div class="absolute bottom-4 left-4 w-16 h-16 bg-white/5 rounded-full blur-lg"></div>
								
								<div class="relative p-6">
									<div class="flex justify-between items-start mb-4">
										<div>
											<h3 class="theme-text font-bold text-lg capitalize tracking-wide">{pokemon.name}</h3>
											<div class="flex gap-2 mt-2">
												{#each pokemon.types as type}
													<span class="px-3 py-1 bg-white/20 backdrop-blur-sm theme-text capitalize text-xs rounded-full font-medium border border-white/20">
														{type.type.name}
													</span>
												{/each}
											</div>
										</div>
										<span class="theme-text text-sm font-bold bg-white/30 px-3 py-1 rounded-full backdrop-blur-sm">
											#{pokemon.id.toString().padStart(3, '0')}
										</span>
									</div>
									
									<div class="flex justify-center mb-4">
										<div class="relative">
											<div class="absolute inset-0 bg-white/20 rounded-full blur-lg scale-110"></div>
											<img
												src={pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
												alt={pokemon.name}
												class="relative w-24 h-24 object-contain transform group-hover:scale-110 transition-transform duration-300"
												loading="lazy"
											/>
										</div>
									</div>
									
									<div class="text-center">
										<div class="inline-flex items-center theme-text text-sm font-medium bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm">
											<span>View Details</span>
											<svg class="w-3 h-3 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
											</svg>
										</div>
									</div>
								</div>
							</div>
						</a>
					{/each}
				</div>
			</section>
		{/if}
	</main>