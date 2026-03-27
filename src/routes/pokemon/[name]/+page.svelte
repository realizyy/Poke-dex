<script lang="ts">
	import { goto } from '$app/navigation';
	import {
		getTypeColor,
		getStatTotal,
		calculateTypeWeaknesses,
		getGenerationFromId
	} from '$lib/utils/pokemon-utils';
	import { teamStore } from '$lib/stores/team.svelte';
	import { onMount } from 'svelte';
	import EvolutionChain from '../../../components/ui/EvolutionChain.svelte';
	import TypeBadge from '../../../components/ui/TypeBadge.svelte';
	import StatBar from '../../../components/ui/StatBar.svelte';
	import AddToTeamModal from '../../../components/ui/AddToTeamModal.svelte';
	import type { PageData } from './$types';
	import type { EncounterArea } from '$lib/types';
	import { PokemonService } from '$lib/services/pokemon-service';
	import { TcgService } from '$lib/services/tcg-service';
	import { ChevronLeft, Layers } from '$lib/icons';
	import type { TcgCardBrief } from '$lib/types';

	export let data: PageData;
	const pokemon = data.pokemon;
	const species = data.species;

	// Modal state
	let openModal: string | null = null;
	let showAddToTeamModal = false;

	onMount(() => {
		teamStore.loadTeams();
	});

	function handleBack() {
		if (window.history.length > 1) history.back();
		else goto('/search');
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			if (openModal) openModal = null;
			else if (showAddToTeamModal) showAddToTeamModal = false;
		}
	}

	function toRoman(n: number): string {
		const r = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
		return r[n - 1] ?? String(n);
	}

	$: typeColor = pokemon ? getTypeColor(pokemon.types[0].type.name) : '#6b7280';
	$: pokemonName = pokemon
		? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
		: '';
	$: statTotal = pokemon ? getStatTotal(pokemon) : 0;
	$: weaknesses = pokemon
		? calculateTypeWeaknesses(pokemon.types.map((t) => t.type.name))
		: [];
	$: generation = pokemon ? getGenerationFromId(pokemon.id) : 1;
	$: flavorText =
		species?.flavor_text_entries?.find((e) => e.language.name === 'en')?.flavor_text?.replace(
			/[\n\f\r]/g,
			' '
		) ?? null;

	// Encounter lazy load -- triggered only when Locations modal opens
	let encounterAreas: EncounterArea[] | null = null;
	let loadingEncounters = false;
	let encountersLoaded = false;

	// TCG lazy load -- triggered only when TCG modal opens
	let tcgCards: TcgCardBrief[] | null = null;
	let loadingTcg = false;
	let tcgLoaded = false;

	async function openLocationsModal() {
		openModal = 'locations';
		if (encountersLoaded || !pokemon) return;
		loadingEncounters = true;
		try {
			encounterAreas = await PokemonService.fetchEncounters(pokemon.id);
		} catch {
			encounterAreas = [];
		} finally {
			loadingEncounters = false;
			encountersLoaded = true;
		}
	}

	async function openTcgModal() {
		openModal = 'tcg';
		if (tcgLoaded || !pokemon) return;
		loadingTcg = true;
		try {
			tcgCards = await TcgService.fetchCardsByPokemonName(pokemon.name);
		} catch {
			tcgCards = [];
		} finally {
			loadingTcg = false;
			tcgLoaded = true;
		}
	}

	function formatGenderRate(rate: number): string {
		if (rate === -1) return 'Genderless';
		const femalePct = (rate / 8) * 100;
		return `♂ ${(100 - femalePct).toFixed(1)}% · ♀ ${femalePct.toFixed(1)}%`;
	}

	function formatHatchSteps(counter: number): string {
		return ((counter + 1) * 256).toLocaleString();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{pokemonName ? `${pokemonName} – Pokédex` : 'Pokédex'}</title>
	<meta
		name="description"
		content={pokemon ? `${pokemonName} — stats, moves, abilities, and evolution.` : 'Pokémon detail'}
	/>
</svelte:head>

{#if !pokemon}
	<div class="flex h-screen items-center justify-center bg-base-100">
		<div class="text-center">
			<div class="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-2 border-base-300 border-t-primary"></div>
			<p class="text-sm text-base-content/60">Loading…</p>
		</div>
	</div>
{:else}
	<div class="min-h-screen bg-base-100">

		<!-- HERO -- type-colour background -->
		<div class="relative overflow-hidden" style="background-color: {typeColor};">
			<!-- Decorative rings (right half) -->
			<div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
				<div
					class="absolute -right-16 -top-16 h-80 w-80 rounded-full border-[30px]"
					style="border-color: rgba(255,255,255,0.1);"
				></div>
				<div
					class="absolute -right-2 top-12 h-48 w-48 rounded-full border-[18px]"
					style="border-color: rgba(255,255,255,0.05);"
				></div>
			</div>

			<div class="relative mx-auto max-w-6xl px-5 pt-5 pb-0 sm:px-8 lg:px-16 lg:pt-10 lg:pb-10">
				<button
					onclick={handleBack}
					class="mb-5 flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
					aria-label="Go back"
				>
					<ChevronLeft size={18} />
					Back
				</button>

				<div class="flex items-end justify-between">
					<div class="min-w-0 flex-1 pr-4 lg:pb-2">
						<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-white/60">
							#{pokemon.id.toString().padStart(3, '0')}&nbsp;&middot;&nbsp;Gen&nbsp;{toRoman(generation)}
						</p>
						<h1 class="mb-3 text-4xl font-black capitalize leading-tight text-white lg:text-5xl xl:text-6xl">
							{pokemonName}
						</h1>
						<div class="mb-4 flex flex-wrap gap-2">
							{#each pokemon.types as t}
								<TypeBadge type={t.type.name} size="md" />
							{/each}
						</div>
						<div class="flex flex-wrap gap-x-6 gap-y-1 text-sm font-medium text-white/80">
							<span>{(pokemon.height / 10).toFixed(1)} m</span>
							<span>{(pokemon.weight / 10).toFixed(1)} kg</span>
							{#if pokemon.base_experience}
								<span>{pokemon.base_experience} XP</span>
							{/if}
						</div>
					</div>
					<div class="relative flex-shrink-0">
						<img
							src={pokemon.sprites.other['official-artwork'].front_default}
							alt={pokemonName}
							class="relative z-10 h-44 w-44 object-contain drop-shadow-2xl sm:h-56 sm:w-56 lg:h-72 lg:w-72 xl:h-80 xl:w-80"
							width="320"
							height="320"
							loading="eager"
							fetchpriority="high"
						/>
					</div>
				</div>
			</div>
		</div>

		<!-- MAIN CONTENT -- single unified responsive layout -->
		<div class="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 lg:py-12">
			<div class="grid grid-cols-1 gap-8 md:grid-cols-[280px_1fr]">

				<!-- LEFT SIDEBAR (sticky on md+) -->
				<div class="space-y-5 md:sticky md:top-6 md:self-start">

					<!-- Base Stats -->
					<div class="rounded-2xl p-5" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
						<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">Base Stats</p>
						<div class="space-y-2.5">
							{#each pokemon.stats as stat}
								<StatBar name={stat.stat.name} value={stat.base_stat} />
							{/each}
						</div>
						<div class="mt-4 flex items-center justify-between border-t border-base-300 pt-3">
							<span class="text-xs font-semibold uppercase tracking-widest text-base-content/40">Total</span>
							<span class="text-2xl font-black" style="color: {typeColor};">{statTotal}</span>
						</div>
					</div>

					<!-- Type Weaknesses -->
					{#if weaknesses.length > 0}
						<div class="rounded-2xl p-5" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
							<p class="mb-3 text-xs font-semibold uppercase tracking-widest text-base-content/40">Weak Against</p>
							<div class="flex flex-wrap gap-1.5">
								{#each weaknesses as w}
									<TypeBadge type={w} size="sm" />
								{/each}
							</div>
						</div>
					{/if}

					<!-- Add to Team CTA -->
					<button
						onclick={() => (showAddToTeamModal = true)}
						class="w-full rounded-2xl px-4 py-3.5 text-sm font-bold text-white transition-opacity hover:opacity-90 active:scale-95"
						style="background-color: {typeColor};"
					>
						+ Add {pokemonName} to Team
					</button>
				</div>

				<!-- RIGHT CONTENT -->
				<div class="min-w-0 space-y-6">

					<!-- Pokedex Flavor Text -->
					{#if flavorText}
						<blockquote
							class="rounded-2xl p-5 text-base italic leading-relaxed text-base-content/70"
							style="background: var(--bg-secondary); border-left: 4px solid {typeColor}; border-top: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);"
						>
							{flavorText}
						</blockquote>
					{/if}

					<!-- About card -->
					<div class="rounded-2xl p-5" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
						<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">About</p>
						<div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
							<div>
								<p class="text-xs text-base-content/50">Height</p>
								<p class="mt-0.5 font-semibold text-base-content">{(pokemon.height / 10).toFixed(1)} m</p>
							</div>
							<div>
								<p class="text-xs text-base-content/50">Weight</p>
								<p class="mt-0.5 font-semibold text-base-content">{(pokemon.weight / 10).toFixed(1)} kg</p>
							</div>
							{#if pokemon.base_experience}
								<div>
									<p class="text-xs text-base-content/50">Base Exp</p>
									<p class="mt-0.5 font-semibold text-base-content">{pokemon.base_experience}</p>
								</div>
							{/if}
							<div>
								<p class="text-xs text-base-content/50">Generation</p>
								<p class="mt-0.5 font-semibold text-base-content">Gen {toRoman(generation)}</p>
							</div>
							{#if species}
								<div>
									<p class="text-xs text-base-content/50">Capture Rate</p>
									<p class="mt-0.5 font-semibold text-base-content">
										{species.capture_rate}
										<span class="text-xs font-normal text-base-content/50">
											({Math.round((species.capture_rate / 255) * 100)}%)
										</span>
									</p>
								</div>
								<div>
									<p class="text-xs text-base-content/50">Happiness</p>
									<p class="mt-0.5 font-semibold text-base-content">{species.base_happiness}</p>
								</div>
								<div>
									<p class="text-xs text-base-content/50">Color</p>
									<p class="mt-0.5 capitalize font-semibold text-base-content">{species.color.name}</p>
								</div>
								{#if species.habitat}
									<div>
										<p class="text-xs text-base-content/50">Habitat</p>
										<p class="mt-0.5 capitalize font-semibold text-base-content">
											{species.habitat.name.replace(/-/g, ' ')}
										</p>
									</div>
								{/if}
							{/if}
						</div>

						{#if pokemon.abilities.length > 0}
							<div class="mt-5 border-t border-base-300 pt-4">
								<p class="mb-2.5 text-xs text-base-content/50">Abilities</p>
								<div class="flex flex-wrap gap-2">
									{#each pokemon.abilities as a}
										<button
											onclick={() => goto(`/abilities/${a.ability.name}`)}
											class="rounded-full bg-base-100 px-3 py-1 text-sm font-medium capitalize text-base-content transition-colors hover:bg-base-300 cursor-pointer"
										>
											{a.ability.name.replace(/-/g, ' ')}{a.is_hidden ? ' (hidden)' : ''}
										</button>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- Section trigger cards -->
					<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
						<button
							onclick={() => (openModal = 'moves')}
							class="card-hover rounded-2xl p-4 text-left transition-all"
							style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
						>
							<p class="text-2xl">&#x2694;&#xFE0F;</p>
							<p class="mt-2 text-sm font-bold text-base-content">Moves</p>
							<p class="text-xs text-base-content/50">{pokemon.moves.length} learnable</p>
						</button>
						<button
							onclick={() => (openModal = 'evolution')}
							class="card-hover rounded-2xl p-4 text-left transition-all"
							style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
						>
							<p class="text-2xl">&#x1F504;</p>
							<p class="mt-2 text-sm font-bold text-base-content">Evolution</p>
							<p class="text-xs text-base-content/50">Chain</p>
						</button>
						{#if species}
							<button
								onclick={() => (openModal = 'breeding')}
								class="card-hover rounded-2xl p-4 text-left transition-all"
								style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								<p class="text-2xl">&#x1F95A;</p>
								<p class="mt-2 text-sm font-bold text-base-content">Breeding</p>
								<p class="text-xs text-base-content/50">Eggs &amp; hatching</p>
							</button>
						{/if}
						<button
							onclick={() => (openModal = 'sprites')}
							class="card-hover rounded-2xl p-4 text-left transition-all"
							style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
						>
							<p class="text-2xl">&#x1F5BC;&#xFE0F;</p>
							<p class="mt-2 text-sm font-bold text-base-content">Sprites</p>
							<p class="text-xs text-base-content/50">Gallery</p>
						</button>
						<button
							onclick={openLocationsModal}
							class="card-hover rounded-2xl p-4 text-left transition-all"
							style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
						>
							<p class="text-2xl">&#x1F4CD;</p>
							<p class="mt-2 text-sm font-bold text-base-content">Locations</p>
							<p class="text-xs text-base-content/50">Where to find</p>
						</button>					<button
						onclick={openTcgModal}
						class="card-hover rounded-2xl p-4 text-left transition-all"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
					>
						<p class="text-2xl">&#x1F0CF;</p>
						<p class="mt-2 text-sm font-bold text-base-content">TCG Cards</p>
						<p class="text-xs text-base-content/50">Trading cards</p>
					</button>					</div>
				</div>
			</div>
		</div>

		<!-- MODALS -->
		{#if openModal}
			<!-- Backdrop -->
			<button
				class="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
				onclick={() => (openModal = null)}
				aria-label="Close modal"
				tabindex="-1"
			></button>

			<!-- Panel -->
			<div
				class="fixed inset-x-4 bottom-4 top-[5vh] z-50 overflow-y-auto rounded-3xl shadow-2xl md:inset-x-auto md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 lg:max-w-3xl"
				style="background: var(--bg-main);"
				role="dialog"
				aria-modal="true"
			>
				<div class="p-6 sm:p-8">
					<!-- Modal header -->
					<div class="mb-6 flex items-center justify-between">
						<h2 class="text-xl font-black text-base-content">
							{#if openModal === 'moves'}Moves
							{:else if openModal === 'evolution'}Evolution Chain
							{:else if openModal === 'breeding'}Breeding
							{:else if openModal === 'sprites'}Sprites Gallery						{:else if openModal === 'tcg'}TCG Cards							{:else}Encounter Locations
							{/if}
						</h2>
						<button
							onclick={() => (openModal = null)}
							class="rounded-full p-2 text-base-content/40 transition-colors hover:bg-base-200 hover:text-base-content"
							aria-label="Close"
						>
							<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
								<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>

					<!-- Moves -->
					{#if openModal === 'moves'}
						<p class="mb-5 text-sm text-base-content/50">
							{pokemonName} can learn
							<strong class="text-base-content">{pokemon.moves.length}</strong> moves.
						</p>
						<div class="flex flex-wrap gap-2">
							{#each pokemon.moves as move}
								<button
									onclick={() => { openModal = null; goto(`/moves/${move.move.name}`); }}
									class="rounded-full bg-base-200 px-3 py-1 text-sm capitalize text-base-content transition-colors hover:bg-base-300 cursor-pointer"
								>
									{move.move.name.replace(/-/g, ' ')}
								</button>
							{/each}
						</div>

					<!-- Evolution -->
					{:else if openModal === 'evolution'}
						<EvolutionChain pokemonId={pokemon.id} />

					<!-- Breeding -->
					{:else if openModal === 'breeding'}
						{#if species}
							<div class="grid grid-cols-2 gap-3">
								<div class="rounded-xl p-4" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
									<p class="text-xs text-base-content/50">Egg Groups</p>
									<p class="mt-1 capitalize font-semibold text-base-content">
										{species.egg_groups.map((g) => g.name.replace(/-/g, ' ')).join(', ') || '-'}
									</p>
								</div>
								<div class="rounded-xl p-4" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
									<p class="text-xs text-base-content/50">Gender Ratio</p>
									<p class="mt-1 font-semibold text-base-content">{formatGenderRate(species.gender_rate)}</p>
								</div>
								<div class="rounded-xl p-4" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
									<p class="text-xs text-base-content/50">Hatch Steps</p>
									<p class="mt-1 font-semibold text-base-content">{formatHatchSteps(species.hatch_counter)}</p>
								</div>
								<div class="rounded-xl p-4" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
									<p class="text-xs text-base-content/50">Growth Rate</p>
									<p class="mt-1 capitalize font-semibold text-base-content">
										{species.growth_rate.name.replace(/-/g, ' ')}
									</p>
								</div>
							</div>
							{#if species.baby_trigger_item}
								<div class="mt-3 rounded-xl p-4" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
									<p class="text-xs text-base-content/50">Baby Trigger Item</p>
									<p class="mt-1 capitalize font-semibold text-base-content">
										{species.baby_trigger_item.name.replace(/-/g, ' ')}
									</p>
								</div>
							{/if}
						{/if}

					<!-- Sprites -->
					{:else if openModal === 'sprites'}
						{@const spriteList = [
							{ label: 'Front',       src: pokemon.sprites.front_default },
							{ label: 'Back',        src: pokemon.sprites.back_default },
							{ label: 'Front Shiny', src: pokemon.sprites.front_shiny },
							{ label: 'Back Shiny',  src: pokemon.sprites.back_shiny },
							{ label: 'Dream World', src: pokemon.sprites.other.dream_world.front_default },
							{ label: 'Home',        src: pokemon.sprites.other.home.front_default },
							{ label: 'Home Shiny',  src: pokemon.sprites.other.home.front_shiny }
						].filter((s) => s.src)}
						<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
							{#each spriteList as s}
								<div
									class="flex flex-col items-center rounded-2xl p-3"
									style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
								>
									<img src={s.src} alt={s.label} class="h-20 w-20 object-contain" loading="lazy" />
									<p class="mt-1.5 text-center text-xs font-medium text-base-content/50">{s.label}</p>
								</div>
							{/each}
						</div>

					<!-- TCG Cards -->
					{:else if openModal === 'tcg'}
						{#if loadingTcg}
							<div class="flex flex-col items-center justify-center py-16 text-center">
								<div
									class="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-base-300"
									style="border-top-color: {typeColor};"
								></div>
								<p class="text-sm text-base-content/50">Loading TCG cards…</p>
							</div>
						{:else if tcgCards && tcgCards.length > 0}
							<p class="mb-4 text-sm text-base-content/50">
								<strong class="text-base-content">{tcgCards.length}</strong> card{tcgCards.length !== 1 ? 's' : ''} found for {pokemonName}.
							</p>
							<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
								{#each tcgCards as card (card.id)}
									<a
										href="/tcg/cards/{card.id}"
										class="group flex flex-col items-center gap-2 rounded-xl p-2 transition-transform hover:scale-105"
										style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
										title="{card.name} #{card.localId}"
									>
										{#if card.image}
											<img
												src="{TcgService.cardImageUrl(card.image, 'low')}"
												alt="{card.name} #{card.localId}"
												class="w-full rounded-lg object-contain"
												loading="lazy"
												width="200" height="280"
											/>
										{:else}
											<div class="w-full aspect-[5/7] rounded-lg flex items-center justify-center" style="background: var(--bg-main);">
												<Layers size={28} class="opacity-20" />
											</div>
										{/if}
										<p class="text-center text-xs font-semibold" style="color: var(--text-main);">{card.name}</p>
										<p class="text-center text-[10px]" style="color: var(--text-muted);">#{card.localId}</p>
									</a>
								{/each}
							</div>
						{:else}
							<div class="flex flex-col items-center justify-center py-16 text-center">
								<p class="mb-2 text-4xl">&#x1F0CF;</p>
								<p class="font-semibold text-base-content">No TCG cards found</p>
								<p class="mt-1 text-sm text-base-content/50">
									No cards found for {pokemonName} in the TCGDex database.
								</p>
								<a
									href="/tcg/cards?q={encodeURIComponent(pokemon.name)}"
									class="mt-4 rounded-xl px-4 py-2 text-sm font-semibold"
									style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
								>Try card search →</a>
							</div>
						{/if}

					<!-- Locations -->
					{:else if openModal === 'locations'}
						{#if loadingEncounters}
							<div class="flex flex-col items-center justify-center py-16 text-center">
								<div
									class="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-base-300"
									style="border-top-color: {typeColor};"
								></div>
								<p class="text-sm text-base-content/50">Loading encounters…</p>
							</div>
						{:else if encounterAreas && encounterAreas.length > 0}
							{@const byVersion = encounterAreas.reduce<
								Record<string, { location: string; method: string; min: number; max: number; chance: number }[]>
							>((acc, area) => {
								for (const vd of area.version_details) {
									const v = vd.version.name;
									if (!acc[v]) acc[v] = [];
									for (const ed of vd.encounter_details) {
										acc[v].push({
											location: area.location_area.name.replace(/-/g, ' '),
											method: ed.method.name.replace(/-/g, ' '),
											min: ed.min_level,
											max: ed.max_level,
											chance: ed.chance
										});
									}
								}
								return acc;
							}, {})}
							<div class="space-y-6">
								{#each Object.entries(byVersion) as [version, locs]}
									<div>
										<p
											class="mb-2 text-xs font-bold uppercase tracking-wider"
											style="color: {typeColor};"
										>
											{version.replace(/-/g, ' ')}
										</p>
										<div class="space-y-1.5">
											{#each locs as loc}
												<div
													class="flex items-center justify-between rounded-xl px-3 py-2 text-sm"
													style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
												>
													<span class="capitalize font-medium text-base-content">{loc.location}</span>
													<span class="text-right text-xs text-base-content/50">
														{loc.method} · Lv {loc.min}–{loc.max} ({loc.chance}%)
													</span>
												</div>
											{/each}
										</div>
									</div>
								{/each}
							</div>
						{:else}
							<div class="flex flex-col items-center justify-center py-16 text-center">
								<p class="mb-2 text-4xl">&#x1F33F;</p>
								<p class="font-semibold text-base-content">Not found in the wild</p>
								<p class="mt-1 text-sm text-base-content/50">
									{pokemonName} cannot be encountered in any location.
								</p>
							</div>
						{/if}
					{/if}
				</div>
			</div>
		{/if}

		<!-- Add-to-Team modal -->
		<AddToTeamModal {pokemon} bind:show={showAddToTeamModal} />
	</div>
{/if}
