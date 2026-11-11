<script lang="ts">
	import CardImage from '../../../components/tcg/CardImage.svelte';
	import { goto } from '$app/navigation';
	import {
		getTypeColor,
		getStatTotal,
		calculateTypeWeaknesses,
		getGenerationFromId
	} from '#lib/utils/pokemon-utils';
	import { teamStore } from '#lib/stores/team.svelte';
	import { onMount } from 'svelte';
	import EvolutionChain from '../../../components/ui/EvolutionChain.svelte';
	import TypeBadge from '../../../components/ui/TypeBadge.svelte';
	import StatBar from '../../../components/ui/StatBar.svelte';
	import AddToTeamModal from '../../../components/ui/AddToTeamModal.svelte';
	import type { PageData } from './$types';
	import type { EncounterArea } from '#lib/types';
	import { PokemonService } from '#lib/services/pokemon-service';
	import { TcgService } from '#lib/services/tcg-service';
	import { ChevronLeft } from '#lib/icons';
	import {
		LEARN_METHODS,
		buildLearnset,
		formatVersionGroup,
		getDefaultVersionGroup,
		getVersionGroups,
		type LearnMethod
	} from '#lib/utils/learnset';
	import type { TcgCardBrief } from '#lib/types';

	export let data: PageData;
	$: pokemon = data.pokemon;
	$: species = data.species;

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
	$: pokemonName = pokemon ? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1) : '';
	$: statTotal = pokemon ? getStatTotal(pokemon) : 0;
	$: weaknesses = pokemon ? calculateTypeWeaknesses(pokemon.types.map((t) => t.type.name)) : [];
	$: generation = pokemon ? getGenerationFromId(pokemon.id) : 1;
	$: flavorText =
		species?.flavor_text_entries
			?.find((e) => e.language.name === 'en')
			?.flavor_text?.replace(/[\n\f\r]/g, ' ') ?? null;

	// Encounter lazy load -- triggered only when Locations modal opens
	let encounterAreas: EncounterArea[] | null = null;
	let loadingEncounters = false;
	let encountersLoaded = false;

	// TCG lazy load -- triggered only when TCG modal opens
	let tcgCards: TcgCardBrief[] | null = null;
	let loadingTcg = false;
	let tcgLoaded = false;

	let selectedVersionGroup = '';
	let selectedMethod: LearnMethod = 'level-up';
	$: versionGroups = getVersionGroups(pokemon.moves);
	$: if (!versionGroups.includes(selectedVersionGroup))
		selectedVersionGroup = getDefaultVersionGroup(pokemon.moves);
	$: learnset = buildLearnset(pokemon.moves, selectedVersionGroup);
	$: methodTabs = LEARN_METHODS.filter((m) => learnset[m.id].length > 0);
	$: if (methodTabs.length > 0 && !methodTabs.some((m) => m.id === selectedMethod)) {
		selectedMethod = methodTabs[0].id;
	}

	let shownPokemonName: string | undefined;
	function resetForPokemon(name: string | undefined) {
		if (name === shownPokemonName) return;
		shownPokemonName = name;
		openModal = null;
		showAddToTeamModal = false;
		encounterAreas = null;
		encountersLoaded = false;
		tcgCards = null;
		tcgLoaded = false;
		selectedVersionGroup = '';
		selectedMethod = 'level-up';
	}
	$: resetForPokemon(pokemon?.name);

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

	$: artwork = pokemon.sprites.other['official-artwork'].front_default;
	$: pageDescription = `${pokemonName} (#${pokemon.id}), ${pokemon.types.map((t) => t.type.name).join('/')} type. Base stats, abilities, moves, and evolution.`;

	function formatHatchSteps(counter: number): string {
		return ((counter + 1) * 256).toLocaleString();
	}
</script>

<svelte:window onkeydown={handleKeydown} />

<svelte:head>
	<title>{pokemonName} – Pokédex</title>
	<meta name="description" content={pageDescription} />
	<meta property="og:type" content="website" />
	<meta property="og:title" content="{pokemonName} – Pokédex" />
	<meta property="og:description" content={pageDescription} />
	{#if artwork}
		<meta property="og:image" content={artwork} />
		<meta name="twitter:image" content={artwork} />
	{/if}
</svelte:head>

<div class="bg-base-100 min-h-screen">
	<!-- HERO -- type-colour background -->
	<div class="relative overflow-hidden" style="background-color: {typeColor};">
		<!-- Decorative rings (right half) -->
		<div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
			<div
				class="absolute -top-16 -right-16 h-80 w-80 rounded-full border-[30px]"
				style="border-color: rgba(255,255,255,0.1);"
			></div>
			<div
				class="absolute top-12 -right-2 h-48 w-48 rounded-full border-[18px]"
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
					<p class="mb-1 text-xs font-semibold tracking-widest text-white/60 uppercase">
						#{pokemon.id.toString().padStart(3, '0')}&nbsp;&middot;&nbsp;Gen&nbsp;{toRoman(
							generation
						)}
					</p>
					<h1
						class="mb-3 text-4xl leading-tight font-black text-white capitalize lg:text-5xl xl:text-6xl"
					>
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
				<div
					class="rounded-2xl p-5"
					style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
				>
					<p class="text-base-content/75 mb-4 text-xs font-semibold tracking-widest uppercase">
						Base Stats
					</p>
					<div class="space-y-2.5">
						{#each pokemon.stats as stat}
							<StatBar name={stat.stat.name} value={stat.base_stat} />
						{/each}
					</div>
					<div class="border-base-300 mt-4 flex items-center justify-between border-t pt-3">
						<span class="text-base-content/75 text-xs font-semibold tracking-widest uppercase"
							>Total</span
						>
						<span class="text-2xl font-black" style="color: {typeColor};">{statTotal}</span>
					</div>
				</div>

				<!-- Type Weaknesses -->
				{#if weaknesses.length > 0}
					<div
						class="rounded-2xl p-5"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
					>
						<p class="text-base-content/75 mb-3 text-xs font-semibold tracking-widest uppercase">
							Weak Against
						</p>
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
						class="text-base-content/70 rounded-2xl p-5 text-base leading-relaxed italic"
						style="background: var(--bg-secondary); border-left: 4px solid {typeColor}; border-top: 1px solid var(--border-color); border-right: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color);"
					>
						{flavorText}
					</blockquote>
				{/if}

				<!-- About card -->
				<div
					class="rounded-2xl p-5"
					style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
				>
					<p class="text-base-content/75 mb-4 text-xs font-semibold tracking-widest uppercase">
						About
					</p>
					<div class="grid grid-cols-2 gap-x-6 gap-y-4 text-sm sm:grid-cols-3">
						<div>
							<p class="text-base-content/75 text-xs">Height</p>
							<p class="text-base-content mt-0.5 font-semibold">
								{(pokemon.height / 10).toFixed(1)} m
							</p>
						</div>
						<div>
							<p class="text-base-content/75 text-xs">Weight</p>
							<p class="text-base-content mt-0.5 font-semibold">
								{(pokemon.weight / 10).toFixed(1)} kg
							</p>
						</div>
						{#if pokemon.base_experience}
							<div>
								<p class="text-base-content/75 text-xs">Base Exp</p>
								<p class="text-base-content mt-0.5 font-semibold">{pokemon.base_experience}</p>
							</div>
						{/if}
						<div>
							<p class="text-base-content/75 text-xs">Generation</p>
							<p class="text-base-content mt-0.5 font-semibold">Gen {toRoman(generation)}</p>
						</div>
						{#if species}
							<div>
								<p class="text-base-content/75 text-xs">Capture Rate</p>
								<p class="text-base-content mt-0.5 font-semibold">
									{species.capture_rate}
									<span class="text-base-content/75 text-xs font-normal">
										({Math.round((species.capture_rate / 255) * 100)}%)
									</span>
								</p>
							</div>
							<div>
								<p class="text-base-content/75 text-xs">Happiness</p>
								<p class="text-base-content mt-0.5 font-semibold">{species.base_happiness}</p>
							</div>
							<div>
								<p class="text-base-content/75 text-xs">Color</p>
								<p class="text-base-content mt-0.5 font-semibold capitalize">
									{species.color.name}
								</p>
							</div>
							{#if species.habitat}
								<div>
									<p class="text-base-content/75 text-xs">Habitat</p>
									<p class="text-base-content mt-0.5 font-semibold capitalize">
										{species.habitat.name.replace(/-/g, ' ')}
									</p>
								</div>
							{/if}
						{/if}
					</div>

					{#if pokemon.abilities.length > 0}
						<div class="border-base-300 mt-5 border-t pt-4">
							<p class="text-base-content/75 mb-2.5 text-xs">Abilities</p>
							<div class="flex flex-wrap gap-2">
								{#each pokemon.abilities as a}
									<button
										onclick={() => goto(`/abilities/${a.ability.name}`)}
										class="bg-base-100 text-base-content hover:bg-base-300 cursor-pointer rounded-full px-3 py-1 text-sm font-medium capitalize transition-colors"
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
						<p class="text-base-content mt-2 text-sm font-bold">Moves</p>
						<p class="text-base-content/75 text-xs">{pokemon.moves.length} learnable</p>
					</button>
					<button
						onclick={() => (openModal = 'evolution')}
						class="card-hover rounded-2xl p-4 text-left transition-all"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
					>
						<p class="text-2xl">&#x1F504;</p>
						<p class="text-base-content mt-2 text-sm font-bold">Evolution</p>
						<p class="text-base-content/75 text-xs">Chain</p>
					</button>
					{#if species}
						<button
							onclick={() => (openModal = 'breeding')}
							class="card-hover rounded-2xl p-4 text-left transition-all"
							style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
						>
							<p class="text-2xl">&#x1F95A;</p>
							<p class="text-base-content mt-2 text-sm font-bold">Breeding</p>
							<p class="text-base-content/75 text-xs">Eggs &amp; hatching</p>
						</button>
					{/if}
					<button
						onclick={() => (openModal = 'sprites')}
						class="card-hover rounded-2xl p-4 text-left transition-all"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
					>
						<p class="text-2xl">&#x1F5BC;&#xFE0F;</p>
						<p class="text-base-content mt-2 text-sm font-bold">Sprites</p>
						<p class="text-base-content/75 text-xs">Gallery</p>
					</button>
					<button
						onclick={openLocationsModal}
						class="card-hover rounded-2xl p-4 text-left transition-all"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
					>
						<p class="text-2xl">&#x1F4CD;</p>
						<p class="text-base-content mt-2 text-sm font-bold">Locations</p>
						<p class="text-base-content/75 text-xs">Where to find</p>
					</button>
					<button
						onclick={openTcgModal}
						class="card-hover rounded-2xl p-4 text-left transition-all"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
					>
						<p class="text-2xl">&#x1F0CF;</p>
						<p class="text-base-content mt-2 text-sm font-bold">TCG Cards</p>
						<p class="text-base-content/75 text-xs">Trading cards</p>
					</button>
				</div>
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
			class="fixed inset-x-4 top-[5vh] bottom-4 z-50 overflow-y-auto rounded-3xl shadow-2xl md:inset-x-auto md:left-1/2 md:w-full md:max-w-2xl md:-translate-x-1/2 lg:max-w-3xl"
			style="background: var(--bg-main);"
			role="dialog"
			aria-modal="true"
		>
			<div class="p-6 sm:p-8">
				<!-- Modal header -->
				<div class="mb-6 flex items-center justify-between">
					<h2 class="text-base-content text-xl font-black">
						{#if openModal === 'moves'}
							{#if versionGroups.length === 0}
								<p class="text-base-content/75 text-sm">
									No move data is available for {pokemonName}.
								</p>
							{:else}
								<div class="mb-4 flex flex-wrap items-center gap-3">
									<label for="learnset-game" class="text-base-content/75 text-sm">Game</label>
									<select
										id="learnset-game"
										bind:value={selectedVersionGroup}
										class="select select-bordered select-sm"
									>
										{#each versionGroups as group (group)}
											<option value={group}>{formatVersionGroup(group)}</option>
										{/each}
									</select>
								</div>

								<div class="mb-4 flex flex-wrap gap-2" role="tablist" aria-label="Learn method">
									{#each methodTabs as tab (tab.id)}
										<button
											role="tab"
											aria-selected={selectedMethod === tab.id}
											onclick={() => (selectedMethod = tab.id)}
											class="rounded-full px-3 py-1 text-sm font-semibold transition-colors {selectedMethod ===
											tab.id
												? 'bg-primary text-primary-content'
												: 'bg-base-200 text-base-content hover:bg-base-300'}"
										>
											{tab.label} ({learnset[tab.id].length})
										</button>
									{/each}
								</div>

								<div role="tabpanel">
									<ul class="grid grid-cols-1 gap-2 sm:grid-cols-2">
										{#each learnset[selectedMethod] as entry (entry.move + entry.level)}
											<li>
												<button
													onclick={() => {
														openModal = null;
														goto(`/moves/${entry.move}`);
													}}
													class="bg-base-200 text-base-content hover:bg-base-300 flex w-full cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-sm capitalize transition-colors"
												>
													<span>{entry.move.replace(/-/g, ' ')}</span>
													{#if selectedMethod === 'level-up'}
														<span class="text-base-content/75 text-xs font-semibold normal-case">
															{entry.level === 0 ? 'Evolve' : `Lv. ${entry.level}`}
														</span>
													{/if}
												</button>
											</li>
										{/each}
									</ul>
								</div>
							{/if}
						{:else if openModal === 'evolution'}Evolution Chain
						{:else if openModal === 'breeding'}Breeding
						{:else if openModal === 'sprites'}Sprites Gallery
						{:else if openModal === 'tcg'}TCG Cards
						{:else}Encounter Locations
						{/if}
					</h2>
					<button
						onclick={() => (openModal = null)}
						class="text-base-content/75 hover:bg-base-200 hover:text-base-content rounded-full p-2 transition-colors"
						aria-label="Close"
					>
						<svg
							xmlns="http://www.w3.org/2000/svg"
							width="18"
							height="18"
							viewBox="0 0 24 24"
							fill="none"
							stroke="currentColor"
							stroke-width="2.5"
							stroke-linecap="round"
							stroke-linejoin="round"
						>
							<line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
						</svg>
					</button>
				</div>

				<!-- Moves -->
				{#if openModal === 'moves'}
					<p class="text-base-content/75 mb-5 text-sm">
						{pokemonName} can learn
						<strong class="text-base-content">{pokemon.moves.length}</strong> moves.
					</p>
					<div class="flex flex-wrap gap-2">
						{#each pokemon.moves as move}
							<button
								onclick={() => {
									openModal = null;
									goto(`/moves/${move.move.name}`);
								}}
								class="bg-base-200 text-base-content hover:bg-base-300 cursor-pointer rounded-full px-3 py-1 text-sm capitalize transition-colors"
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
							<div
								class="rounded-xl p-4"
								style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								<p class="text-base-content/75 text-xs">Egg Groups</p>
								<p class="text-base-content mt-1 font-semibold capitalize">
									{species.egg_groups.map((g) => g.name.replace(/-/g, ' ')).join(', ') || '-'}
								</p>
							</div>
							<div
								class="rounded-xl p-4"
								style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								<p class="text-base-content/75 text-xs">Gender Ratio</p>
								<p class="text-base-content mt-1 font-semibold">
									{formatGenderRate(species.gender_rate)}
								</p>
							</div>
							<div
								class="rounded-xl p-4"
								style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								<p class="text-base-content/75 text-xs">Hatch Steps</p>
								<p class="text-base-content mt-1 font-semibold">
									{formatHatchSteps(species.hatch_counter)}
								</p>
							</div>
							<div
								class="rounded-xl p-4"
								style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								<p class="text-base-content/75 text-xs">Growth Rate</p>
								<p class="text-base-content mt-1 font-semibold capitalize">
									{species.growth_rate.name.replace(/-/g, ' ')}
								</p>
							</div>
						</div>
						{#if species.baby_trigger_item}
							<div
								class="mt-3 rounded-xl p-4"
								style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								<p class="text-base-content/75 text-xs">Baby Trigger Item</p>
								<p class="text-base-content mt-1 font-semibold capitalize">
									{species.baby_trigger_item.name.replace(/-/g, ' ')}
								</p>
							</div>
						{/if}
					{/if}

					<!-- Sprites -->
				{:else if openModal === 'sprites'}
					{@const spriteList = [
						{ label: 'Front', src: pokemon.sprites.front_default },
						{ label: 'Back', src: pokemon.sprites.back_default },
						{ label: 'Front Shiny', src: pokemon.sprites.front_shiny },
						{ label: 'Back Shiny', src: pokemon.sprites.back_shiny },
						{ label: 'Dream World', src: pokemon.sprites.other.dream_world.front_default },
						{ label: 'Home', src: pokemon.sprites.other.home.front_default },
						{ label: 'Home Shiny', src: pokemon.sprites.other.home.front_shiny }
					].filter((s) => s.src)}
					<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
						{#each spriteList as s}
							<div
								class="flex flex-col items-center rounded-2xl p-3"
								style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								<img src={s.src} alt={s.label} class="h-20 w-20 object-contain" loading="lazy" />
								<p class="text-base-content/75 mt-1.5 text-center text-xs font-medium">
									{s.label}
								</p>
							</div>
						{/each}
					</div>

					<!-- TCG Cards -->
				{:else if openModal === 'tcg'}
					{#if loadingTcg}
						<div class="flex flex-col items-center justify-center py-16 text-center">
							<div
								class="border-base-300 mb-3 h-8 w-8 animate-spin rounded-full border-2"
								style="border-top-color: {typeColor};"
							></div>
							<p class="text-base-content/75 text-sm">Loading TCG cards…</p>
						</div>
					{:else if tcgCards && tcgCards.length > 0}
						<p class="text-base-content/75 mb-4 text-sm">
							<strong class="text-base-content">{tcgCards.length}</strong>
							card{tcgCards.length !== 1 ? 's' : ''} found for {pokemonName}.
						</p>
						<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
							{#each tcgCards as card (card.id)}
								<a
									href="/tcg/cards/{card.id}"
									class="group flex flex-col items-center gap-2 rounded-xl p-2 transition-transform hover:scale-105"
									style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
									title="{card.name} #{card.localId}"
								>
									<CardImage
										image={card.image}
										alt={card.name}
										class="w-full rounded-lg object-contain"
									/>
									<p class="text-center text-xs font-semibold" style="color: var(--text-main);">
										{card.name}
									</p>
									<p class="text-center text-[10px]" style="color: var(--text-muted);">
										#{card.localId}
									</p>
								</a>
							{/each}
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center py-16 text-center">
							<p class="mb-2 text-4xl">&#x1F0CF;</p>
							<p class="text-base-content font-semibold">No TCG cards found</p>
							<p class="text-base-content/75 mt-1 text-sm">
								No cards found for {pokemonName} in the TCGDex database.
							</p>
							<a
								href="/tcg/cards?q={encodeURIComponent(pokemon.name)}"
								class="mt-4 rounded-xl px-4 py-2 text-sm font-semibold"
								style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
								>Try card search →</a
							>
						</div>
					{/if}

					<!-- Locations -->
				{:else if openModal === 'locations'}
					{#if loadingEncounters}
						<div class="flex flex-col items-center justify-center py-16 text-center">
							<div
								class="border-base-300 mb-3 h-8 w-8 animate-spin rounded-full border-2"
								style="border-top-color: {typeColor};"
							></div>
							<p class="text-base-content/75 text-sm">Loading encounters…</p>
						</div>
					{:else if encounterAreas && encounterAreas.length > 0}
						{@const byVersion = encounterAreas.reduce<
							Record<
								string,
								{ location: string; method: string; min: number; max: number; chance: number }[]
							>
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
										class="mb-2 text-xs font-bold tracking-wider uppercase"
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
												<span class="text-base-content font-medium capitalize">{loc.location}</span>
												<span class="text-base-content/75 text-right text-xs">
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
							<p class="text-base-content font-semibold">Not found in the wild</p>
							<p class="text-base-content/75 mt-1 text-sm">
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
