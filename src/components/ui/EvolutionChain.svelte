<script lang="ts">
	import { onMount } from 'svelte';
	import { PokemonService } from '$lib/services/pokemon-service';
	import { getTypeColor } from '$lib/utils/pokemon-utils';
	import { goto } from '$app/navigation';
	import type { EvolutionChain, EvolutionChainLink, EvolutionDetail } from '$lib/types';

	interface ParsedEvolution {
		name: string;
		id: string;
		level: number;
		evolutionDetails: EvolutionDetail[];
	}

	export let pokemonId: number;

	let evolutionChain: EvolutionChain | null = null;
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

	function parseEvolutionChain(chain: EvolutionChain): ParsedEvolution[] {
		const evolutions: ParsedEvolution[] = [];

		function traverseChain(evolution: EvolutionChainLink | undefined, level = 0) {
			if (!evolution) return;

			evolutions.push({
				name: evolution.species.name,
				id: evolution.species.url.split('/').slice(-2)[0],
				level,
				evolutionDetails: evolution.evolution_details || []
			});

			for (const next of evolution.evolves_to ?? []) {
				traverseChain(next, level + 1);
			}
		}

		traverseChain(chain.chain);
		return evolutions;
	}

	async function getPokemonTypes(pokemonId: number): Promise<string[]> {
		try {
			const pokemon = await PokemonService.fetchPokemon(pokemonId);
			return pokemon.types.map((type) => type.type.name);
		} catch (error) {
			console.error('Error fetching Pokemon types:', error);
			return [];
		}
	}

	function describeCondition(detail: EvolutionDetail | undefined): string {
		if (!detail) return '';
		if (detail.min_level) return `(Level ${detail.min_level})`;
		if (detail.item) return `(${detail.item.name.replace('-', ' ')})`;
		if (detail.trigger?.name === 'trade') return '(Trade)';
		if (detail.trigger?.name === 'use-item') return '(Item)';
		return '';
	}

	function getEvolutionConditionForArrow(
		evolutionChain: EvolutionChain | null,
		currentIndex: number
	): string {
		if (!evolutionChain?.chain) return '';
		const first = evolutionChain.chain.evolves_to?.[0];
		if (currentIndex === 0) return describeCondition(first?.evolution_details?.[0]);
		if (currentIndex === 1) {
			return describeCondition(first?.evolves_to?.[0]?.evolution_details?.[0]);
		}
		return '';
	}
</script>

{#if loading}
	<div class="flex items-center justify-center py-8">
		<div class="text-center">
			<div class="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-b-2 border-blue-500"></div>
			<p class="theme-text-secondary">Loading evolution chain...</p>
		</div>
	</div>
{:else if error}
	<div class="py-8 text-center">
		<svg
			class="theme-text-secondary mx-auto mb-4 h-12 w-12"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
			></path>
		</svg>
		<h3 class="theme-text mb-2 text-lg font-medium">Error Loading Evolution Chain</h3>
		<p class="theme-text-secondary mb-4">Failed to load evolution information</p>
		<button
			onclick={loadEvolutionChain}
			class="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-blue-600"
		>
			Try Again
		</button>
	</div>
{:else if evolutionChain}
	{@const evolutions = parseEvolutionChain(evolutionChain)}
	<div class="space-y-6">
		<!-- Evolution Chain -->
		<div class="flex flex-wrap items-center justify-center gap-4">
			{#each evolutions as evolution, index}
				<div class="flex items-center">
					<!-- Pokemon Card -->
					<div
						class="theme-bg-secondary cursor-pointer rounded-xl p-4 text-center transition-transform hover:scale-105"
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
							class="mx-auto mb-3 h-20 w-20 object-contain"
							width="80"
							height="80"
							loading="lazy"
							onerror={(e) => {
								const target = e.target as HTMLImageElement;
								if (target) {
									target.src = '/favicon.png';
								}
							}}
						/>
						<div class="theme-text mb-2 text-sm font-bold capitalize">
							#{evolution.id}
							{evolution.name}
						</div>
						<!-- Type badges will be loaded dynamically -->
						<div class="flex justify-center gap-3">
							{#await getPokemonTypes(parseInt(evolution.id))}
								<div class="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
							{:then types}
								{#each types as type}
									<span
										class="rounded-full px-2 py-0.5 text-xs font-medium text-white capitalize"
										style="background-color: {getTypeColor(type)}"
									>
										{type}
									</span>
								{/each}
							{:catch}
								<span class="theme-text-secondary text-sm">Unknown</span>
							{/await}
						</div>
					</div>

					<!-- Evolution Arrow -->
					{#if index < evolutions.length - 1}
						<div class="mx-3 text-center">
							<svg
								class="theme-text-secondary mx-auto mb-1 h-5 w-5"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									stroke-linecap="round"
									stroke-linejoin="round"
									stroke-width="2"
									d="M17 8l4 4m0 0l-4 4m4-4H3"
								></path>
							</svg>
							<div class="theme-text-secondary text-xs font-medium">
								{getEvolutionConditionForArrow(evolutionChain, index)}
							</div>
						</div>
					{/if}
				</div>
			{/each}
		</div>
	</div>
{:else}
	<div class="py-8 text-center">
		<svg
			class="theme-text-secondary mx-auto mb-4 h-12 w-12"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
			></path>
		</svg>
		<h3 class="theme-text mb-2 text-lg font-medium">No Evolution Chain</h3>
		<p class="theme-text-secondary">
			This Pokemon does not have an evolution chain or the information is not available.
		</p>
	</div>
{/if}
