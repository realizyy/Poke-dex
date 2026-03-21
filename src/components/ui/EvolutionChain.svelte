<script lang="ts">
	import { onMount } from 'svelte';
	import { PokemonService } from '$lib/services/pokemon-service';
	import { getTypeColor } from '$lib/utils/pokemon-utils';
	import { goto } from '$app/navigation';
	
	export let pokemonId: number;
	
	let evolutionChain: any = null;
	let loading = false;
	let error = false;
	
	onMount(async () => {
		await loadEvolutionChain();
	});
	
	async function loadEvolutionChain() {
		loading = true;
		error = false;
		
		try {
			evolutionChain = await PokemonService.getEvolutionChainForPokemon(pokemonId);
		} catch (err) {
			console.error('Error loading evolution chain:', err);
			error = true;
		} finally {
			loading = false;
		}
	}
	
	function parseEvolutionChain(chain: any): any[] {
		const evolutions: any[] = [];
		
		function traverseChain(evolution: any, level: number = 0) {
			if (!evolution) return;
			
			evolutions.push({
				name: evolution.species.name,
				id: evolution.species.url.split('/').slice(-2)[0],
				level: level,
				evolutionDetails: evolution.evolution_details || []
			});
			
			if (evolution.evolves_to && evolution.evolves_to.length > 0) {
				evolution.evolves_to.forEach((next: any) => {
					traverseChain(next, level + 1);
				});
			}
		}
		
		traverseChain(chain.chain);
		return evolutions;
	}
	
	async function getPokemonTypes(pokemonId: number): Promise<string[]> {
		try {
			const pokemon = await PokemonService.fetchPokemon(pokemonId);
			return pokemon.types.map((type: any) => type.type.name);
		} catch (error) {
			console.error('Error fetching Pokemon types:', error);
			return [];
		}
	}
	
	function getEvolutionCondition(details: any[]): string {
		if (!details || details.length === 0) return '';
		
		const detail = details[0];
		if (detail.min_level) {
			return `(Level ${detail.min_level})`;
		} else if (detail.item) {
			return `(${detail.item.name.replace('-', ' ')})`;
		} else if (detail.trigger?.name === 'trade') {
			return '(Trade)';
		} else if (detail.trigger?.name === 'use-item') {
			return `(${detail.item?.name?.replace('-', ' ') || 'Item'})`;
		}
		
		return '';
	}

	function getEvolutionConditionForIndex(evolution: any, index: number): string {
		// Untuk Pokemon pertama (index 0), tidak ada condition
		if (index === 0) return '';
		
		// Untuk Pokemon kedua dan seterusnya, gunakan evolution details dari Pokemon sebelumnya
		return getEvolutionCondition(evolution.evolutionDetails);
	}

	function getEvolutionConditionForArrow(evolutionChain: any, currentIndex: number): string {
		if (!evolutionChain || !evolutionChain.chain) return '';
		
		// Untuk arrow pertama (index 0), ambil condition dari evolusi pertama
		if (currentIndex === 0) {
			const firstEvolution = evolutionChain.chain.evolves_to?.[0];
			if (firstEvolution?.evolution_details?.length > 0) {
				const detail = firstEvolution.evolution_details[0];
				if (detail.min_level) {
					return `(Level ${detail.min_level})`;
				} else if (detail.item) {
					return `(${detail.item.name.replace('-', ' ')})`;
				} else if (detail.trigger?.name === 'trade') {
					return '(Trade)';
				} else if (detail.trigger?.name === 'use-item') {
					return `(${detail.item?.name?.replace('-', ' ') || 'Item'})`;
				}
			}
		}
		
		// Untuk arrow kedua (index 1), ambil condition dari evolusi kedua
		if (currentIndex === 1) {
			const firstEvolution = evolutionChain.chain.evolves_to?.[0];
			const secondEvolution = firstEvolution?.evolves_to?.[0];
			if (secondEvolution?.evolution_details?.length > 0) {
				const detail = secondEvolution.evolution_details[0];
				if (detail.min_level) {
					return `(Level ${detail.min_level})`;
				} else if (detail.item) {
					return `(${detail.item.name.replace('-', ' ')})`;
				} else if (detail.trigger?.name === 'trade') {
					return '(Trade)';
				} else if (detail.trigger?.name === 'use-item') {
					return `(${detail.item?.name?.replace('-', ' ') || 'Item'})`;
				}
			}
		}
		
		return '';
	}
</script>

{#if loading}
	<div class="flex justify-center items-center py-8">
		<div class="text-center">
			<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500 mx-auto mb-4"></div>
			<p class="theme-text-secondary">Loading evolution chain...</p>
		</div>
	</div>
{:else if error}
	<div class="text-center py-8">
		<svg class="mx-auto h-12 w-12 theme-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
		</svg>
		<h3 class="text-lg font-medium theme-text mb-2">Error Loading Evolution Chain</h3>
		<p class="theme-text-secondary mb-4">Failed to load evolution information</p>
		<button
			onclick={loadEvolutionChain}
			class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
		>
			Try Again
		</button>
	</div>
{:else if evolutionChain}
	{@const evolutions = parseEvolutionChain(evolutionChain)}
	<div class="space-y-6">
		<!-- Evolution Chain -->
		<div class="flex flex-wrap justify-center items-center gap-4">
			{#each evolutions as evolution, index}
				<div class="flex items-center">
					<!-- Pokemon Card -->
					<div class="theme-bg-secondary rounded-xl p-4 text-center cursor-pointer hover:scale-105 transition-transform"
						onclick={() => goto(`/pokemon/${evolution.name}`)}
						role="button"
						tabindex="0"
						onkeydown={(e) => {
							if (e.key === 'Enter' || e.key === ' ') {
								goto(`/pokemon/${evolution.name}`);
							}
						}}
					>
						<img
							src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${evolution.id}.png`}
							alt={evolution.name}
						class="w-20 h-20 mx-auto mb-3 object-contain"
						width="80" height="80"
							loading="lazy"
							onerror={(e) => {
								const target = e.target as HTMLImageElement;
								if (target) {
									target.src = '/favicon.png';
								}
							}}
						/>
						<div class="text-sm font-bold theme-text capitalize mb-2">
							#{evolution.id} {evolution.name}
						</div>
						<!-- Type badges will be loaded dynamically -->
						<div class="flex justify-center gap-3">
							{#await getPokemonTypes(parseInt(evolution.id))}
								<div class="w-8 h-4 bg-gray-300 rounded animate-pulse"></div>
							{:then types}
								{#each types as type}
									<span class="px-2 py-0.5 rounded-full text-xs font-medium text-white capitalize"
										style="background-color: {getTypeColor(type)}">
										{type}
									</span>
								{/each}
							{:catch}
								<span class="text-sm theme-text-secondary">Unknown</span>
							{/await}
						</div>
					</div>
					
					<!-- Evolution Arrow -->
					{#if index < evolutions.length - 1}
						<div class="mx-3 text-center">
							<svg class="w-5 h-5 theme-text-secondary mx-auto mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path>
							</svg>
							<div class="text-xs theme-text-secondary font-medium">
								{getEvolutionConditionForArrow(evolutionChain, index)}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="text-center py-8">
		<svg class="mx-auto h-12 w-12 theme-text-secondary mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
		</svg>
		<h3 class="text-lg font-medium theme-text mb-2">No Evolution Chain</h3>
		<p class="theme-text-secondary">
			This Pokemon does not have an evolution chain or the information is not available.
		</p>
	</div>
{/if} 