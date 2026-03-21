<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { PokemonService } from '$lib';
	import {
		getTypeColor,
		getStatName,
		getStatTotal,
		calculateTypeWeaknesses,
		getGenerationFromId
	} from '$lib/utils/pokemon-utils';
	import TypeBadge from '../../components/ui/TypeBadge.svelte';
	import LoadingSpinner from '../../components/ui/LoadingSpinner.svelte';
	import { ArrowLeftRight, X } from '$lib/icons';
	import type { Pokemon } from '$lib/types';

	const STAT_KEYS = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

	let pokemonA = $state<Pokemon | null>(null);
	let pokemonB = $state<Pokemon | null>(null);
	let loadingA = $state(false);
	let loadingB = $state(false);
	let errorA = $state('');
	let errorB = $state('');
	let queryA = $state('');
	let queryB = $state('');
	let suggestionsA = $state<Pokemon[]>([]);
	let suggestionsB = $state<Pokemon[]>([]);
	let showSuggestionsA = $state(false);
	let showSuggestionsB = $state(false);

	let debounceA: ReturnType<typeof setTimeout>;
	let debounceB: ReturnType<typeof setTimeout>;

	async function loadPokemonByName(name: string, slot: 'a' | 'b') {
		if (!name.trim()) {
			if (slot === 'a') { pokemonA = null; errorA = ''; }
			else { pokemonB = null; errorB = ''; }
			return;
		}
		if (slot === 'a') { loadingA = true; errorA = ''; }
		else { loadingB = true; errorB = ''; }
		try {
			const p = await PokemonService.fetchPokemonByName(name);
			if (slot === 'a') pokemonA = p;
			else pokemonB = p;
		} catch {
			if (slot === 'a') { errorA = `"${name}" not found`; pokemonA = null; }
			else { errorB = `"${name}" not found`; pokemonB = null; }
		} finally {
			if (slot === 'a') loadingA = false;
			else loadingB = false;
		}
	}

	onMount(() => {
		const a = $page.url.searchParams.get('a') ?? '';
		const b = $page.url.searchParams.get('b') ?? '';
		if (a) { queryA = a; loadPokemonByName(a, 'a'); }
		if (b) { queryB = b; loadPokemonByName(b, 'b'); }
	});

	async function fetchSuggestions(query: string, slot: 'a' | 'b') {
		if (!query.trim() || query.length < 2) {
			if (slot === 'a') { suggestionsA = []; showSuggestionsA = false; }
			else { suggestionsB = []; showSuggestionsB = false; }
			return;
		}
		try {
			const results = await PokemonService.searchPokemon(query, 8);
			if (slot === 'a') { suggestionsA = results; showSuggestionsA = results.length > 0; }
			else { suggestionsB = results; showSuggestionsB = results.length > 0; }
		} catch { /* ignore */ }
	}

	function handleInputA() {
		clearTimeout(debounceA);
		debounceA = setTimeout(() => fetchSuggestions(queryA, 'a'), 300);
	}

	function handleInputB() {
		clearTimeout(debounceB);
		debounceB = setTimeout(() => fetchSuggestions(queryB, 'b'), 300);
	}

	function updateUrl(nameA: string, nameB: string) {
		const params = new URLSearchParams();
		if (nameA) params.set('a', nameA);
		if (nameB) params.set('b', nameB);
		const qs = params.toString();
		goto(qs ? `?${qs}` : '/compare', { replaceState: true, keepFocus: true });
	}

	function selectPokemon(pokemon: Pokemon, slot: 'a' | 'b') {
		if (slot === 'a') {
			pokemonA = pokemon;
			queryA = pokemon.name;
			suggestionsA = [];
			showSuggestionsA = false;
			errorA = '';
		} else {
			pokemonB = pokemon;
			queryB = pokemon.name;
			suggestionsB = [];
			showSuggestionsB = false;
			errorB = '';
		}
		updateUrl(
			slot === 'a' ? pokemon.name : (pokemonA?.name ?? queryA.trim()),
			slot === 'b' ? pokemon.name : (pokemonB?.name ?? queryB.trim())
		);
	}

	function clearSlot(slot: 'a' | 'b') {
		if (slot === 'a') { pokemonA = null; queryA = ''; errorA = ''; suggestionsA = []; showSuggestionsA = false; }
		else { pokemonB = null; queryB = ''; errorB = ''; suggestionsB = []; showSuggestionsB = false; }
		updateUrl(
			slot === 'a' ? '' : (pokemonA?.name ?? queryA.trim()),
			slot === 'b' ? '' : (pokemonB?.name ?? queryB.trim())
		);
	}

	function handleBlur(slot: 'a' | 'b') {
		// Small delay so click on suggestion registers before hiding
		setTimeout(() => {
			if (slot === 'a') showSuggestionsA = false;
			else showSuggestionsB = false;
		}, 150);
	}

	function getStat(pokemon: Pokemon, statKey: string): number {
		return pokemon.stats.find((s) => s.stat.name === statKey)?.base_stat ?? 0;
	}

	function getSprite(p: Pokemon): string {
		return (
			p.sprites?.other?.['official-artwork']?.front_default ??
			p.sprites?.front_default ??
			''
		);
	}

	function capitalize(s: string): string {
		return s.charAt(0).toUpperCase() + s.slice(1).replace(/-/g, ' ');
	}

	const bothLoaded = $derived(!!pokemonA && !!pokemonB);
	const eitherLoaded = $derived(!!pokemonA || !!pokemonB);

	const totalA = $derived(pokemonA ? getStatTotal(pokemonA) : 0);
	const totalB = $derived(pokemonB ? getStatTotal(pokemonB) : 0);
	const weaknessesA = $derived(
		pokemonA ? calculateTypeWeaknesses(pokemonA.types.map((t) => t.type.name)) : []
	);
	const weaknessesB = $derived(
		pokemonB ? calculateTypeWeaknesses(pokemonB.types.map((t) => t.type.name)) : []
	);
</script>

<svelte:head>
	<title>Pokémon Comparison – Pokédex</title>
	<meta
		name="description"
		content="Compare two Pokémon side-by-side: stats, type weaknesses, abilities and more."
	/>
</svelte:head>

<!-- ─── Page wrapper ────────────────────────────────────────────────────── -->
<div class="min-h-screen" style="background-color: var(--bg-main);">

	<!-- ─── Sticky selector bar ──────────────────────────────────────────── -->
	<div
		class="sticky top-16 z-30 border-b px-4 py-4 backdrop-blur-xl"
		style="background-color: color-mix(in oklch, var(--bg-main) 90%, transparent); border-color: var(--border-color);"
	>
		<div class="mx-auto max-w-4xl">
			<!-- Row: [selector A] [VS] [selector B] -->
			<div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3">

				<!-- ── Selector A ── -->
				<div class="relative">
					<div
						class="flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors"
						style="background-color: var(--bg-secondary); border-color: var(--border-color);"
					>
						<span class="shrink-0 text-[10px] font-bold uppercase tracking-widest opacity-50" style="color: var(--text-main);">A</span>
						<input
							type="text"
							placeholder="Search Pokémon…"
							class="min-w-0 flex-1 bg-transparent text-sm outline-none"
							style="color: var(--text-main);"
							bind:value={queryA}
							oninput={handleInputA}
							onfocus={() => { if (suggestionsA.length) showSuggestionsA = true; }}
							onblur={() => handleBlur('a')}
						/>
						{#if queryA}
							<button
								onclick={() => clearSlot('a')}
								class="shrink-0 rounded-full p-0.5 opacity-50 transition-opacity hover:opacity-100"
								aria-label="Clear slot A"
							>
								<X size={12} />
							</button>
						{/if}
					</div>

					<!-- Suggestions dropdown A -->
					{#if showSuggestionsA && suggestionsA.length}
						<ul
							class="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border shadow-xl"
							style="background-color: var(--bg-secondary); border-color: var(--border-color);"
						>
							{#each suggestionsA as s}
								<li>
									<button
										class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:brightness-90"
										style="background-color: var(--bg-secondary); color: var(--text-main);"
										onmousedown={() => selectPokemon(s, 'a')}
									>
										<img
											src={s.sprites?.front_default ?? ''}
											alt={s.name}
											class="h-8 w-8 object-contain"
											loading="lazy"
										/>
										<span class="capitalize">{s.name}</span>
										<span class="ml-auto text-xs opacity-40">#{String(s.id).padStart(3, '0')}</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>

				<!-- VS badge -->
				<div
					class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold tracking-wide text-white shadow"
					style="background: radial-gradient(circle at 35% 35%, #ef4444, #991b1b);"
				>
					VS
				</div>

				<!-- ── Selector B ── -->
				<div class="relative">
					<div
						class="flex items-center gap-2 rounded-xl border px-3 py-2 transition-colors"
						style="background-color: var(--bg-secondary); border-color: var(--border-color);"
					>
						{#if queryB}
							<button
								onclick={() => clearSlot('b')}
								class="shrink-0 rounded-full p-0.5 opacity-50 transition-opacity hover:opacity-100"
								aria-label="Clear slot B"
							>
								<X size={12} />
							</button>
						{/if}
						<input
							type="text"
							placeholder="Search Pokémon…"
							class="min-w-0 flex-1 bg-transparent text-right text-sm outline-none"
							style="color: var(--text-main);"
							bind:value={queryB}
							oninput={handleInputB}
							onfocus={() => { if (suggestionsB.length) showSuggestionsB = true; }}
							onblur={() => handleBlur('b')}
						/>
						<span class="shrink-0 text-[10px] font-bold uppercase tracking-widest opacity-50" style="color: var(--text-main);">B</span>
					</div>

					<!-- Suggestions dropdown B -->
					{#if showSuggestionsB && suggestionsB.length}
						<ul
							class="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border shadow-xl"
							style="background-color: var(--bg-secondary); border-color: var(--border-color);"
						>
							{#each suggestionsB as s}
								<li>
									<button
										class="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:brightness-90"
										style="background-color: var(--bg-secondary); color: var(--text-main);"
										onmousedown={() => selectPokemon(s, 'b')}
									>
										<img
											src={s.sprites?.front_default ?? ''}
											alt={s.name}
											class="h-8 w-8 object-contain"
											loading="lazy"
										/>
										<span class="capitalize">{s.name}</span>
										<span class="ml-auto text-xs opacity-40">#{String(s.id).padStart(3, '0')}</span>
									</button>
								</li>
							{/each}
						</ul>
					{/if}
				</div>
			</div>
		</div>
	</div>

	<!-- ─── Content area ─────────────────────────────────────────────────── -->
	<div class="mx-auto max-w-4xl px-4 py-6">

		<!-- Empty state -->
		{#if !eitherLoaded && !loadingA && !loadingB}
			<div class="flex flex-col items-center justify-center gap-6 py-20 text-center">
				<div
					class="flex items-center justify-center rounded-full p-6 shadow-inner"
					style="background-color: var(--bg-secondary);"
				>
					<ArrowLeftRight size={40} class="opacity-30" />
				</div>
				<div>
					<h2 class="text-xl font-bold" style="color: var(--text-main);">Compare Pokémon</h2>
					<p class="mt-2 max-w-xs text-sm opacity-60" style="color: var(--text-main);">
						Search for two Pokémon above to see a side-by-side comparison of their stats,
						type weaknesses, and abilities.
					</p>
				</div>
				<div class="flex gap-3 text-xs opacity-40" style="color: var(--text-main);">
					<span class="rounded-full border px-3 py-1" style="border-color: var(--border-color);">pikachu</span>
					<span>vs</span>
					<span class="rounded-full border px-3 py-1" style="border-color: var(--border-color);">raichu</span>
				</div>
			</div>
		{/if}

		<!-- Hero cards — shown as soon as one or both are loading/loaded -->
		{#if eitherLoaded || loadingA || loadingB}
			<div class="mb-6 grid grid-cols-2 gap-4">

				<!-- Hero card A -->
				<div
					class="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
					style="background-color: {pokemonA ? getTypeColor(pokemonA.types[0].type.name) : 'var(--bg-secondary)'}; min-height: 200px;"
				>
					{#if loadingA}
						<LoadingSpinner size="sm" text="Loading…" />
					{:else if pokemonA}
						<!-- Decorative ring -->
						<div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
							<div class="absolute -right-10 -top-10 h-48 w-48 rounded-full" style="border: 24px solid rgba(255,255,255,0.10);"></div>
						</div>
						<div class="relative flex flex-col gap-2">
							<div class="text-xs font-bold uppercase tracking-widest opacity-70">
								#{String(pokemonA.id).padStart(3, '0')} · Gen {getGenerationFromId(pokemonA.id)}
							</div>
							<h2 class="text-xl font-extrabold capitalize leading-tight">{pokemonA.name}</h2>
							<div class="flex flex-wrap gap-1">
								{#each pokemonA.types as t}
									<TypeBadge type={t.type.name} size="sm" />
								{/each}
							</div>
							<img
								src={getSprite(pokemonA)}
								alt={pokemonA.name}
								class="mt-2 h-28 w-28 object-contain drop-shadow-lg sm:h-36 sm:w-36"
								loading="eager"
							/>
						</div>
					{:else if errorA}
						<div class="flex h-full flex-col items-center justify-center gap-2 text-center opacity-80">
							<span class="text-3xl">?</span>
							<p class="text-sm">{errorA}</p>
						</div>
					{:else}
						<div class="flex h-full flex-col items-center justify-center opacity-30">
							<span class="text-4xl">A</span>
							<p class="mt-2 text-xs">Pick a Pokémon</p>
						</div>
					{/if}
				</div>

				<!-- Hero card B -->
				<div
					class="relative overflow-hidden rounded-2xl p-5 text-white shadow-lg"
					style="background-color: {pokemonB ? getTypeColor(pokemonB.types[0].type.name) : 'var(--bg-secondary)'}; min-height: 200px;"
				>
					{#if loadingB}
						<LoadingSpinner size="sm" text="Loading…" />
					{:else if pokemonB}
						<!-- Decorative ring -->
						<div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
							<div class="absolute -right-10 -top-10 h-48 w-48 rounded-full" style="border: 24px solid rgba(255,255,255,0.10);"></div>
						</div>
						<div class="relative flex flex-col gap-2">
							<div class="text-xs font-bold uppercase tracking-widest opacity-70">
								#{String(pokemonB.id).padStart(3, '0')} · Gen {getGenerationFromId(pokemonB.id)}
							</div>
							<h2 class="text-xl font-extrabold capitalize leading-tight">{pokemonB.name}</h2>
							<div class="flex flex-wrap gap-1">
								{#each pokemonB.types as t}
									<TypeBadge type={t.type.name} size="sm" />
								{/each}
							</div>
							<img
								src={getSprite(pokemonB)}
								alt={pokemonB.name}
								class="mt-2 h-28 w-28 object-contain drop-shadow-lg sm:h-36 sm:w-36"
								loading="eager"
							/>
						</div>
					{:else if errorB}
						<div class="flex h-full flex-col items-center justify-center gap-2 text-center opacity-80">
							<span class="text-3xl">?</span>
							<p class="text-sm">{errorB}</p>
						</div>
					{:else}
						<div class="flex h-full flex-col items-center justify-center opacity-30">
							<span class="text-4xl">B</span>
							<p class="mt-2 text-xs">Pick a Pokémon</p>
						</div>
					{/if}
				</div>
			</div>
		{/if}

		<!-- ── Full comparison sections (both loaded) ── -->
		{#if bothLoaded && pokemonA && pokemonB}

			<!-- ── Base Stats ─────────────────────────────────────────────── -->
			<section
				class="mb-4 overflow-hidden rounded-2xl border"
				style="background-color: var(--bg-card); border-color: var(--border-color);"
			>
				<div
					class="border-b px-5 py-3"
					style="border-color: var(--border-color); background-color: var(--bg-secondary);"
				>
					<h3 class="text-sm font-bold uppercase tracking-wider opacity-60" style="color: var(--text-main);">Base Stats</h3>
				</div>
				<div class="divide-y px-5 py-2" style="divide-color: var(--border-color);">
					{#each STAT_KEYS as statKey}
						{@const valA = getStat(pokemonA, statKey)}
						{@const valB = getStat(pokemonB, statKey)}
						{@const aWins = valA > valB}
						{@const bWins = valB > valA}
						{@const maxVal = Math.max(valA, valB, 1)}
						<div class="grid grid-cols-[2.5rem_1fr_6rem_1fr_2.5rem] items-center gap-2 py-2">
							<!-- A value -->
							<span
								class="text-right text-sm font-bold tabular-nums"
								class:text-green-500={aWins}
								style="color: {aWins ? '' : 'var(--text-secondary)'};"
							>{valA}</span>
							<!-- A bar (right-to-left fill) -->
							<div class="flex justify-end">
								<div
									class="h-2.5 rounded-l-full transition-all duration-500"
									style="width: {Math.round((valA / 255) * 100)}%; background-color: {aWins ? '#22c55e' : '#94a3b8'}; min-width: 2px;"
								></div>
							</div>
							<!-- Stat label -->
							<div class="text-center text-xs font-semibold opacity-50" style="color: var(--text-main);">
								{getStatName(statKey)}
							</div>
							<!-- B bar (left-to-right fill) -->
							<div class="flex justify-start">
								<div
									class="h-2.5 rounded-r-full transition-all duration-500"
									style="width: {Math.round((valB / 255) * 100)}%; background-color: {bWins ? '#22c55e' : '#94a3b8'}; min-width: 2px;"
								></div>
							</div>
							<!-- B value -->
							<span
								class="text-left text-sm font-bold tabular-nums"
								class:text-green-500={bWins}
								style="color: {bWins ? '' : 'var(--text-secondary)'};"
							>{valB}</span>
						</div>
					{/each}

					<!-- Total row -->
					<div class="grid grid-cols-[2.5rem_1fr_6rem_1fr_2.5rem] items-center gap-2 border-t py-2" style="border-color: var(--border-color);">
						<span
							class="text-right text-sm font-extrabold tabular-nums"
							style="color: {totalA > totalB ? '#22c55e' : 'var(--text-secondary)'};"
						>{totalA}</span>
						<div class="flex justify-end">
							<div
								class="h-2.5 rounded-l-full transition-all duration-500"
								style="width: {Math.round((totalA / 720) * 100)}%; background-color: {totalA > totalB ? '#22c55e' : '#94a3b8'}; min-width: 2px;"
							></div>
						</div>
						<div class="text-center text-xs font-bold opacity-70" style="color: var(--text-main);">Total</div>
						<div class="flex justify-start">
							<div
								class="h-2.5 rounded-r-full transition-all duration-500"
								style="width: {Math.round((totalB / 720) * 100)}%; background-color: {totalB > totalA ? '#22c55e' : '#94a3b8'}; min-width: 2px;"
							></div>
						</div>
						<span
							class="text-left text-sm font-extrabold tabular-nums"
							style="color: {totalB > totalA ? '#22c55e' : 'var(--text-secondary)'};"
						>{totalB}</span>
					</div>
				</div>
			</section>

			<!-- ── Physical Info ──────────────────────────────────────────── -->
			<section
				class="mb-4 overflow-hidden rounded-2xl border"
				style="background-color: var(--bg-card); border-color: var(--border-color);"
			>
				<div
					class="border-b px-5 py-3"
					style="border-color: var(--border-color); background-color: var(--bg-secondary);"
				>
					<h3 class="text-sm font-bold uppercase tracking-wider opacity-60" style="color: var(--text-main);">Physical Info</h3>
				</div>
				<div class="divide-y" style="divide-color: var(--border-color);">
					{#each [
						{ label: 'Height', a: (pokemonA.height / 10).toFixed(1) + ' m', b: (pokemonB.height / 10).toFixed(1) + ' m', numA: pokemonA.height, numB: pokemonB.height },
						{ label: 'Weight', a: (pokemonA.weight / 10).toFixed(1) + ' kg', b: (pokemonB.weight / 10).toFixed(1) + ' kg', numA: pokemonA.weight, numB: pokemonB.weight },
						{ label: 'Base Exp', a: String(pokemonA.base_experience ?? '—'), b: String(pokemonB.base_experience ?? '—'), numA: pokemonA.base_experience ?? 0, numB: pokemonB.base_experience ?? 0 }
					] as row}
						{@const aWins = row.numA > row.numB}
						{@const bWins = row.numB > row.numA}
						<div class="grid grid-cols-3 items-center px-5 py-3 text-sm">
							<span
								class="font-semibold tabular-nums"
								style="color: {aWins ? '#22c55e' : 'var(--text-secondary)'};"
							>{row.a}</span>
							<span class="text-center text-xs font-semibold opacity-50" style="color: var(--text-main);">{row.label}</span>
							<span
								class="text-right font-semibold tabular-nums"
								style="color: {bWins ? '#22c55e' : 'var(--text-secondary)'};"
							>{row.b}</span>
						</div>
					{/each}
				</div>
			</section>

			<!-- ── Type Weaknesses ────────────────────────────────────────── -->
			<section
				class="mb-4 overflow-hidden rounded-2xl border"
				style="background-color: var(--bg-card); border-color: var(--border-color);"
			>
				<div
					class="border-b px-5 py-3"
					style="border-color: var(--border-color); background-color: var(--bg-secondary);"
				>
					<h3 class="text-sm font-bold uppercase tracking-wider opacity-60" style="color: var(--text-main);">Type Weaknesses</h3>
				</div>
				<div class="grid grid-cols-2 divide-x" style="divide-color: var(--border-color);">
					<div class="flex flex-wrap gap-1.5 p-4">
						{#if weaknessesA.length}
							{#each weaknessesA as w}
								<TypeBadge type={w} size="sm" />
							{/each}
						{:else}
							<span class="text-xs opacity-40" style="color: var(--text-main);">No weaknesses</span>
						{/if}
					</div>
					<div class="flex flex-wrap gap-1.5 p-4">
						{#if weaknessesB.length}
							{#each weaknessesB as w}
								<TypeBadge type={w} size="sm" />
							{/each}
						{:else}
							<span class="text-xs opacity-40" style="color: var(--text-main);">No weaknesses</span>
						{/if}
					</div>
				</div>
			</section>

			<!-- ── Abilities ──────────────────────────────────────────────── -->
			<section
				class="mb-4 overflow-hidden rounded-2xl border"
				style="background-color: var(--bg-card); border-color: var(--border-color);"
			>
				<div
					class="border-b px-5 py-3"
					style="border-color: var(--border-color); background-color: var(--bg-secondary);"
				>
					<h3 class="text-sm font-bold uppercase tracking-wider opacity-60" style="color: var(--text-main);">Abilities</h3>
				</div>
				<div class="grid grid-cols-2 divide-x" style="divide-color: var(--border-color);">
					<div class="flex flex-wrap gap-2 p-4">
						{#each pokemonA.abilities as a}
							<a
								href="/abilities/{a.ability.name}"
								class="rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors hover:brightness-90"
								style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
							>{a.ability.name.replace(/-/g, ' ')}</a>
						{/each}
					</div>
					<div class="flex flex-wrap gap-2 p-4">
						{#each pokemonB.abilities as a}
							<a
								href="/abilities/{a.ability.name}"
								class="rounded-full border px-3 py-1 text-xs font-semibold capitalize transition-colors hover:brightness-90"
								style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
							>{a.ability.name.replace(/-/g, ' ')}</a>
						{/each}
					</div>
				</div>
			</section>

		{/if}

		<!-- Hint when only one is loaded -->
		{#if eitherLoaded && !bothLoaded && !loadingA && !loadingB}
			<div class="mt-4 text-center text-sm opacity-50" style="color: var(--text-main);">
				Pick a second Pokémon to see the full comparison
			</div>
		{/if}

	</div>
</div>
