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
	import type { PageData } from './$types';
	import type { EncounterArea } from '$lib/types';
	import { PokemonService } from '$lib/services/pokemon-service';
	import { ChevronLeft } from '$lib/icons';

	export let data: PageData;
	const pokemon = data.pokemon;
	const species = data.species;
	let activeTab = 'About';

	onMount(() => {
		teamStore.loadTeams();
		if (pokemon) loadEncounters();
	});

	function addToTeam(teamId: string) {
		if (pokemon) teamStore.addPokemonToTeam(teamId, pokemon);
	}

	function handleBack() {
		if (window.history.length > 1) history.back();
		else goto('/search');
	}

	function toRoman(n: number): string {
		const r = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX'];
		return r[n - 1] ?? String(n);
	}

	const tabs = ['About', 'Base Stats', 'Moves', 'Evolution', 'Sprites', 'Encounters'];

	$: typeColor = pokemon ? getTypeColor(pokemon.types[0].type.name) : '#6b7280';
	$: pokemonName = pokemon
		? pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)
		: '';
	$: statTotal = pokemon ? getStatTotal(pokemon) : 0;
	$: weaknesses = pokemon
		? calculateTypeWeaknesses(pokemon.types.map((t) => t.type.name))
		: [];
	$: generation = pokemon ? getGenerationFromId(pokemon.id) : 1;
	let movesShowAll = false;

	// ── Encounter lazy load ─────────────────────────────────────────
	let encounterAreas: EncounterArea[] | null = null;
	let loadingEncounters = false;
	let encountersLoaded = false;

	async function loadEncounters() {
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

	// ── Breeding helpers ────────────────────────────────────────
	function formatGenderRate(rate: number): string {
		if (rate === -1) return 'Genderless';
		const femalePct = (rate / 8) * 100;
		return `♂ ${(100 - femalePct).toFixed(1)}% · ♀ ${femalePct.toFixed(1)}%`;
	}

	function formatHatchSteps(counter: number): string {
		return ((counter + 1) * 256).toLocaleString();
	}
</script>

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

		<!-- ═══════════════════════════════════════════════════════════
		     HERO  — shared across all breakpoints
		════════════════════════════════════════════════════════════ -->
		<div class="relative overflow-hidden" style="background-color: {typeColor};">
			<!-- Pokéball decorative rings — clipped to right half to prevent arc bleeding onto left -->
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
				<!-- Back button -->
				<button
					onclick={handleBack}
					class="mb-5 flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
					aria-label="Go back"
				>
					<ChevronLeft size={18} />
					Back
				</button>

				<!-- Identity (left) + Artwork (right) -->
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

					<!-- Artwork – scales up on larger viewports and hangs into the content area on mobile -->
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


		<!-- ═══════════════════════════════════════════════════════════
		     MOBILE + TABLET  (hidden on lg+): tabbed layout
		════════════════════════════════════════════════════════════ -->
		<div class="lg:hidden -mt-6 relative z-20 min-h-[60vh] rounded-t-3xl bg-base-100">
			<!-- Tab strip -->
			<div class="sticky top-0 z-30 rounded-t-3xl border-b border-base-300 bg-base-100">
				<div class="flex overflow-x-auto scrollbar-none">
					{#each tabs as tab}
						<button
							onclick={() => (activeTab = tab)}
							class="shrink-0 whitespace-nowrap border-b-2 px-3 py-4 text-center text-xs font-semibold transition-colors sm:text-sm"
							style="border-color: {activeTab === tab
								? typeColor
								: 'transparent'}; color: {activeTab === tab ? typeColor : 'var(--text-secondary)'};"
						>
							{tab}
						</button>
					{/each}
				</div>
			</div>

			<!-- Tab content -->
			<div class="px-5 py-8 sm:px-8">
				{#if activeTab === 'About'}
					<div class="space-y-8">
						<!-- Physiology -->
						<section>
							<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">
								Physiology
							</p>
							<div class="flex flex-wrap gap-8">
								<div>
									<p class="text-2xl font-bold text-base-content">
										{(pokemon.height / 10).toFixed(1)} m
									</p>
									<p class="mt-0.5 text-xs text-base-content/50">Height</p>
								</div>
								<div>
									<p class="text-2xl font-bold text-base-content">
										{(pokemon.weight / 10).toFixed(1)} kg
									</p>
									<p class="mt-0.5 text-xs text-base-content/50">Weight</p>
								</div>
								{#if pokemon.base_experience}
									<div>
										<p class="text-2xl font-bold text-base-content">{pokemon.base_experience}</p>
										<p class="mt-0.5 text-xs text-base-content/50">Base Exp</p>
									</div>
								{/if}
								<div>
									<p class="text-2xl font-bold text-base-content">Gen {toRoman(generation)}</p>
									<p class="mt-0.5 text-xs text-base-content/50">Generation</p>
								</div>
							</div>
						</section>

						<!-- Abilities -->
						<section>
							<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">
								Abilities
							</p>
							<div class="flex flex-wrap gap-2">
								{#each pokemon.abilities as a}
									<button
										onclick={() => goto(`/abilities/${a.ability.name}`)}
										class="rounded-full bg-base-200 px-4 py-1.5 text-sm font-medium capitalize text-base-content transition-colors hover:bg-base-300 cursor-pointer"
									>
										{a.ability.name.replace(/-/g, ' ')}
									</button>
								{/each}
							</div>
						</section>

						<!-- Breeding -->
						{#if species}
							<section>
								<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">
									Breeding
								</p>
								<div class="space-y-2.5 text-sm">
									<div class="flex justify-between gap-4">
										<span class="text-base-content/50">Egg Groups</span>
										<span class="capitalize text-right font-medium text-base-content">
											{species.egg_groups.map((g) => g.name.replace(/-/g, ' ')).join(', ') || '—'}
										</span>
									</div>
									<div class="flex justify-between gap-4">
										<span class="text-base-content/50">Gender</span>
										<span class="font-medium text-base-content">{formatGenderRate(species.gender_rate)}</span>
									</div>
									<div class="flex justify-between gap-4">
										<span class="text-base-content/50">Hatch Steps</span>
										<span class="font-medium text-base-content">{formatHatchSteps(species.hatch_counter)}</span>
									</div>
									<div class="flex justify-between gap-4">
										<span class="text-base-content/50">Growth Rate</span>
										<span class="capitalize font-medium text-base-content">{species.growth_rate.name.replace(/-/g, ' ')}</span>
									</div>
								</div>
							</section>
						{/if}

						<!-- Type Weaknesses -->
						{#if weaknesses.length > 0}
							<section>
								<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">
									Weak Against
								</p>
								<div class="flex flex-wrap gap-2">
									{#each weaknesses as w}
										<TypeBadge type={w} size="sm" />
									{/each}
								</div>
							</section>
						{/if}

						<!-- Add to Team -->
						{#if teamStore.teams.length > 0}
							<section>
								<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">
									Add to Team
								</p>
								<div class="space-y-2">
									{#each teamStore.teams as team}
										<button
											onclick={() => addToTeam(team.id)}
											disabled={team.pokemons.length >= 6}
											class="flex w-full items-center justify-between rounded-xl bg-base-200 px-4 py-3 text-left transition-colors hover:bg-base-300 disabled:cursor-not-allowed disabled:opacity-40"
										>
											<span class="font-medium text-base-content">{team.name}</span>
											<span class="text-sm text-base-content/50">{team.pokemons.length}/6</span>
										</button>
									{/each}
								</div>
							</section>
						{/if}
					</div>

				{:else if activeTab === 'Base Stats'}
					<div class="space-y-3">
						{#each pokemon.stats as stat}
							<StatBar name={stat.stat.name} value={stat.base_stat} />
						{/each}
					</div>
					<div class="mt-6 flex items-center justify-between border-t border-base-300 pt-4">
						<span class="text-xs font-semibold uppercase tracking-widest text-base-content/40">Total</span>
						<span class="text-2xl font-black" style="color: {typeColor};">{statTotal}</span>
					</div>

				{:else if activeTab === 'Moves'}
					<p class="mb-5 text-sm text-base-content/50">
						{pokemonName} can learn
						<strong class="text-base-content">{pokemon.moves.length}</strong> moves.
					</p>
					<div class="flex flex-wrap gap-2">
						{#each (movesShowAll ? pokemon.moves : pokemon.moves.slice(0, 20)) as move}
							<button
								onclick={() => goto(`/moves/${move.move.name}`)}
								class="rounded-full bg-base-200 px-3 py-1 text-sm capitalize text-base-content transition-colors hover:bg-base-300 cursor-pointer"
							>
								{move.move.name.replace(/-/g, ' ')}
							</button>
						{/each}
					</div>
					{#if pokemon.moves.length > 20}
						<button
							onclick={() => (movesShowAll = !movesShowAll)}
							class="mt-4 flex items-center gap-2 rounded-xl bg-base-200 px-4 py-2.5 text-sm font-medium text-base-content transition-colors hover:bg-base-300"
						>
							{movesShowAll ? 'Show less ↑' : `Show all ${pokemon.moves.length} moves ↓`}
						</button>
					{/if}

				{:else if activeTab === 'Evolution'}
					<EvolutionChain pokemonId={pokemon.id} />

				{:else if activeTab === 'Sprites'}
					{@const spriteList = [
						{ label: 'Front',         src: pokemon.sprites.front_default },
						{ label: 'Back',          src: pokemon.sprites.back_default },
						{ label: 'Front Shiny',   src: pokemon.sprites.front_shiny },
						{ label: 'Back Shiny',    src: pokemon.sprites.back_shiny },
						{ label: 'Dream World',   src: pokemon.sprites.other.dream_world.front_default },
						{ label: 'Home',          src: pokemon.sprites.other.home.front_default },
						{ label: 'Home Shiny',    src: pokemon.sprites.other.home.front_shiny }
					].filter((s) => s.src)}
					<div class="grid grid-cols-3 gap-3">
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

				{:else if activeTab === 'Encounters'}
					{#if loadingEncounters}
						<div class="flex flex-col items-center justify-center py-16 text-center">
							<div class="mb-3 h-8 w-8 animate-spin rounded-full border-2 border-base-300" style="border-top-color: {typeColor};"></div>
							<p class="text-sm text-base-content/50">Loading encounters…</p>
						</div>
					{:else if encounterAreas && encounterAreas.length > 0}
						{@const byVersion = encounterAreas.reduce<Record<string, { location: string; method: string; min: number; max: number; chance: number }[]>>((acc, area) => {
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
									<p class="mb-2 text-xs font-bold uppercase tracking-wider" style="color: {typeColor};">{version.replace(/-/g, ' ')}</p>
									<div class="space-y-1.5">
										{#each locs as loc}
											<div class="flex items-center justify-between rounded-xl px-3 py-2 text-sm" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
												<span class="capitalize font-medium text-base-content">{loc.location}</span>
												<span class="text-right text-xs text-base-content/50">{loc.method} · Lv {loc.min}–{loc.max} ({loc.chance}%)</span>
											</div>
										{/each}
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="flex flex-col items-center justify-center py-16 text-center">
							<span class="mb-3 text-4xl">🌿</span>
							<p class="font-semibold text-base-content">Not found in the wild</p>
							<p class="mt-1 text-sm text-base-content/50">{pokemonName} cannot be encountered in any location.</p>
						</div>
					{/if}
				{/if}
			</div>
		</div>


		<!-- ═══════════════════════════════════════════════════════════
		     DESKTOP  (hidden below lg): two-column, no tabs
		════════════════════════════════════════════════════════════ -->
		<div class="hidden lg:block -mt-6 relative z-20">
			<div class="mx-auto max-w-6xl px-16 py-12">
				<div class="grid grid-cols-[5fr_7fr] gap-16 xl:grid-cols-[2fr_3fr]">

					<!-- ── LEFT COL: Stats · Weaknesses · Team (sticky) ─── -->
					<div class="sticky top-24 self-start space-y-10">

						<!-- Base Stats -->
						<section>
							<p class="mb-5 text-xs font-semibold uppercase tracking-widest text-base-content/40">
								Base Stats
							</p>
							<div class="space-y-3">
								{#each pokemon.stats as stat}
									<StatBar name={stat.stat.name} value={stat.base_stat} />
								{/each}
							</div>
							<div class="mt-5 flex items-center justify-between border-t border-base-300 pt-4">
								<span class="text-xs font-semibold uppercase tracking-widest text-base-content/40">Total</span>
								<span class="text-2xl font-black" style="color: {typeColor};">{statTotal}</span>
							</div>
						</section>

						<!-- Type Weaknesses -->
						{#if weaknesses.length > 0}
							<section>
								<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">
									Weak Against
								</p>
								<div class="flex flex-wrap gap-2">
									{#each weaknesses as w}
										<TypeBadge type={w} size="sm" />
									{/each}
								</div>
							</section>
						{/if}

						<!-- Add to Team -->
						{#if teamStore.teams.length > 0}
							<section>
								<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">
									Add to Team
								</p>
								<div class="space-y-2">
									{#each teamStore.teams as team}
										<button
											onclick={() => addToTeam(team.id)}
											disabled={team.pokemons.length >= 6}
											class="flex w-full items-center justify-between rounded-xl bg-base-200 px-4 py-3 text-left transition-colors hover:bg-base-300 disabled:cursor-not-allowed disabled:opacity-40"
										>
											<span class="font-medium text-base-content">{team.name}</span>
											<span class="text-sm text-base-content/50">{team.pokemons.length}/6</span>
										</button>
									{/each}
								</div>
							</section>
						{/if}
					</div>

					<!-- ── RIGHT COL: Profile · Moves · Evolution ────── -->
					<div class="space-y-10">

						<!-- Profile: physiology + generation + abilities -->
						<section>
							<p class="mb-5 text-xs font-semibold uppercase tracking-widest text-base-content/40">
								Profile
							</p>
							<div class="grid grid-cols-2 gap-x-8 gap-y-6 sm:grid-cols-4">
								<div>
									<p class="text-2xl font-bold text-base-content">
										{(pokemon.height / 10).toFixed(1)} m
									</p>
									<p class="mt-0.5 text-xs text-base-content/50">Height</p>
								</div>
								<div>
									<p class="text-2xl font-bold text-base-content">
										{(pokemon.weight / 10).toFixed(1)} kg
									</p>
									<p class="mt-0.5 text-xs text-base-content/50">Weight</p>
								</div>
								{#if pokemon.base_experience}
									<div>
										<p class="text-2xl font-bold text-base-content">{pokemon.base_experience}</p>
										<p class="mt-0.5 text-xs text-base-content/50">Base Exp</p>
									</div>
								{/if}
								<div>
									<p class="text-2xl font-bold text-base-content">Gen {toRoman(generation)}</p>
									<p class="mt-0.5 text-xs text-base-content/50">Generation</p>
								</div>
							</div>

							<div class="mt-8">
								<p class="mb-4 text-xs font-semibold uppercase tracking-widest text-base-content/40">
									Abilities
								</p>
								<div class="flex flex-wrap gap-2">
									{#each pokemon.abilities as a}
										<button
											onclick={() => goto(`/abilities/${a.ability.name}`)}
											class="rounded-full bg-base-200 px-4 py-1.5 text-sm font-medium capitalize text-base-content transition-colors hover:bg-base-300 cursor-pointer"
										>
											{a.ability.name.replace(/-/g, ' ')}
										</button>
									{/each}
								</div>
							</div>
						</section>

						<hr class="border-base-300" />

						<!-- Moves -->
						<section>
							<p class="mb-2 text-xs font-semibold uppercase tracking-widest text-base-content/40">
								Moves
							</p>
							<p class="mb-5 text-sm text-base-content/50">
								{pokemonName} can learn
								<strong class="text-base-content">{pokemon.moves.length}</strong> moves.
							</p>
							<div class="flex flex-wrap gap-2">
									{#each (movesShowAll ? pokemon.moves : pokemon.moves.slice(0, 20)) as move}
										<button
											onclick={() => goto(`/moves/${move.move.name}`)}
											class="rounded-full bg-base-200 px-3 py-1 text-sm capitalize text-base-content transition-colors hover:bg-base-300 cursor-pointer"
										>
											{move.move.name.replace(/-/g, ' ')}
										</button>
									{/each}
								</div>
								{#if pokemon.moves.length > 20}
									<button
										onclick={() => (movesShowAll = !movesShowAll)}
										class="mt-4 flex items-center gap-2 rounded-xl bg-base-200 px-4 py-2.5 text-sm font-medium text-base-content transition-colors hover:bg-base-300"
									>
										{movesShowAll ? 'Show less ↑' : `Show all ${pokemon.moves.length} moves ↓`}
									</button>
								{/if}
						</section>

						<hr class="border-base-300" />

						<!-- Evolution Chain -->
						<section>
							<p class="mb-5 text-xs font-semibold uppercase tracking-widest text-base-content/40">
								Evolution Chain
							</p>
							<EvolutionChain pokemonId={pokemon.id} />
						</section>

						<hr class="border-base-300" />

						<!-- Breeding -->
						{#if species}
							<section>
								<p class="mb-5 text-xs font-semibold uppercase tracking-widest text-base-content/40">
									Breeding
								</p>
								<div class="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
									<div>
										<p class="mb-1 text-xs text-base-content/50">Egg Groups</p>
										<p class="capitalize font-medium text-base-content">
											{species.egg_groups.map((g) => g.name.replace(/-/g, ' ')).join(', ') || '—'}
										</p>
									</div>
									<div>
										<p class="mb-1 text-xs text-base-content/50">Gender</p>
										<p class="font-medium text-base-content">{formatGenderRate(species.gender_rate)}</p>
									</div>
									<div>
										<p class="mb-1 text-xs text-base-content/50">Hatch Steps</p>
										<p class="font-medium text-base-content">{formatHatchSteps(species.hatch_counter)}</p>
									</div>
									<div>
										<p class="mb-1 text-xs text-base-content/50">Growth Rate</p>
										<p class="capitalize font-medium text-base-content">{species.growth_rate.name.replace(/-/g, ' ')}</p>
									</div>
								</div>
							</section>

							<hr class="border-base-300" />
						{/if}

						<!-- Sprites Gallery -->
						<section>
							<p class="mb-5 text-xs font-semibold uppercase tracking-widest text-base-content/40">
								Sprites
							</p>
							<div class="grid grid-cols-3 gap-3 sm:grid-cols-4">
								{#each [
									{ label: 'Front',         src: pokemon.sprites.front_default },
									{ label: 'Back',          src: pokemon.sprites.back_default },
									{ label: 'Front Shiny',   src: pokemon.sprites.front_shiny },
									{ label: 'Back Shiny',    src: pokemon.sprites.back_shiny },
									{ label: 'Dream World',   src: pokemon.sprites.other.dream_world.front_default },
									{ label: 'Home',          src: pokemon.sprites.other.home.front_default },
									{ label: 'Home Shiny',    src: pokemon.sprites.other.home.front_shiny }
								].filter((s) => s.src) as s}
									<div
										class="flex flex-col items-center rounded-2xl p-3"
										style="background: var(--bg-secondary); border: 1px solid var(--border-color);"
									>
										<img src={s.src} alt={s.label} class="h-20 w-20 object-contain" loading="lazy" />
										<p class="mt-1.5 text-center text-xs font-medium text-base-content/50">{s.label}</p>
									</div>
								{/each}
							</div>
						</section>

						<hr class="border-base-300" />

						<!-- Encounter Locations -->
						<section>
							<p class="mb-5 text-xs font-semibold uppercase tracking-widest text-base-content/40">
								Encounter Locations
							</p>
							{#if loadingEncounters}
								<div class="flex items-center gap-3 py-6 text-sm text-base-content/50">
									<div class="h-5 w-5 animate-spin rounded-full border-2 border-base-300" style="border-top-color: {typeColor};"></div>
									Loading encounters…
								</div>
							{:else if encounterAreas && encounterAreas.length > 0}
								{@const byVersion = encounterAreas.reduce<Record<string, { location: string; method: string; min: number; max: number; chance: number }[]>>((acc, area) => {
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
											<p class="mb-2 text-xs font-bold uppercase tracking-wider" style="color: {typeColor};">{version.replace(/-/g, ' ')}</p>
											<div class="space-y-1.5">
												{#each locs as loc}
													<div class="flex items-center justify-between rounded-xl px-3 py-2 text-sm" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
														<span class="capitalize font-medium text-base-content">{loc.location}</span>
														<span class="text-right text-xs text-base-content/50">{loc.method} · Lv {loc.min}–{loc.max} ({loc.chance}%)</span>
													</div>
												{/each}
											</div>
										</div>
									{/each}
								</div>
							{:else}
								<div class="flex flex-col items-center justify-center py-8 text-center">
									<span class="mb-3 text-4xl">🌿</span>
									<p class="font-semibold text-base-content">Not found in the wild</p>
									<p class="mt-1 text-sm text-base-content/50">{pokemonName} cannot be encountered in any location.</p>
								</div>
							{/if}
						</section>

					</div>
				</div>
			</div>
		</div>

	</div>
{/if}
