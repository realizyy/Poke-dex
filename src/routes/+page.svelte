<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Pokemon } from '$lib/types';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { getTypeColor } from '$lib/utils/pokemon-utils';

	let pokemons: Pokemon[] = [];
	let loading = true;
	let searchQuery = '';

	onMount(() => {
		const data = get(page).data;
		pokemons = data.pokemons ?? [];
		loading = false;
	});

	function handleSearch() {
		if (searchQuery.trim()) {
			goto(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	}

	const features = [
		{ num: '01', label: 'Search',  desc: 'Filter 1,025+ Pokémon by type, generation and stat ranges.',  href: '/search',  color: '#3b82f6' },
		{ num: '02', label: 'Compare', desc: 'Place two Pokémon side-by-side and see every difference.',     href: '/compare', color: '#8b5cf6' },
		{ num: '03', label: 'Teams',   desc: 'Build a six-slot team and analyse type coverage.',             href: '/teams',   color: '#22c55e' },
		{ num: '04', label: 'Battle',  desc: 'Simulate turn-by-turn battles with move and type logic.',      href: '/battle',  color: '#ef4444' },
		{ num: '05', label: 'Items',   desc: 'Browse held items, berries, TMs and key items.',               href: '/items',   color: '#f59e0b' },
		{ num: '06', label: 'Natures', desc: 'Compare all 25 natures and their stat and flavour effects.',  href: '/natures', color: '#10b981' },
	];
</script>

<svelte:head>
	<title>Pokédex – Every Pokémon. Every stat.</title>
	<meta name="description" content="Search, compare, build teams and simulate battles for all 1,025 Pokémon — all in one place." />
</svelte:head>

<!-- ─── Hero ─────────────────────────────────────────────────────────────── -->
<section
	class="border-b"
	style="border-color: var(--border-color); background-color: var(--bg-main);"
>
	<div class="mx-auto max-w-5xl px-6 py-16 md:py-24">
		<div class="grid grid-cols-1 items-center gap-12 md:grid-cols-[1fr_auto]">

			<!-- Left: identity + headline + search -->
			<div class="poke-slide-up">
				<!-- Identity mark -->
				<div class="mb-6 flex items-center gap-2.5" style="animation-delay: 0ms;">
					<img
						src="/poke_1.png"
						alt=""
						aria-hidden="true"
						class="h-6 w-6 rounded-full object-contain"
						width="24" height="24"
						loading="eager"
						fetchpriority="high"
					/>
					<span class="text-xs font-bold uppercase tracking-[0.18em]" style="color: var(--brand-red);">Pokédex</span>
				</div>

				<!-- Headline -->
				<h1
					class="mb-4 font-extrabold leading-none tracking-tight"
					style="font-size: var(--text-hero); color: var(--text-main);"
				>
					Every Pokémon.<br />Every stat.
				</h1>

				<!-- Sub-copy -->
				<p class="mb-10 max-w-md text-lg leading-relaxed" style="color: var(--text-secondary); font-size: var(--text-lg);">
					Search, compare, build teams and simulate battles — all in one place.
				</p>

				<!-- Search bar -->
				<form onsubmit={(e) => { e.preventDefault(); handleSearch(); }}>
					<div
						class="flex items-center gap-2 rounded-2xl p-2 shadow-[var(--shadow-card)]"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); max-width: 28rem;"
					>
						<div class="flex-shrink-0 pl-3">
							<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="color: var(--text-muted);">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
							</svg>
						</div>
						<input
							type="text"
							placeholder="Name or #ID…"
							bind:value={searchQuery}
							class="min-w-0 flex-1 bg-transparent py-3 text-base focus:outline-none"
							style="color: var(--text-main);"
						/>
						<button type="submit" class="btn-brand flex-shrink-0 rounded-xl px-5 py-2.5 text-sm font-semibold">
							Search
						</button>
					</div>
				</form>
			</div>

			<!-- Right: hero Pokémon illustration -->
			<div class="hidden md:flex items-center justify-center">
				<div class="relative flex h-56 w-56 items-center justify-center rounded-full"
					style="background: radial-gradient(circle, rgba(139,92,246,0.12) 0%, transparent 70%);">
					<img
						src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png"
						alt="Mewtwo"
						class="h-52 w-52 object-contain drop-shadow-2xl poke-scale-in"
						width="208" height="208"
						loading="eager"
					/>
				</div>
			</div>

		</div>
	</div>
</section>

<!-- ─── Feature grid ──────────────────────────────────────────────────────── -->
<section class="border-b" style="border-color: var(--border-color); background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-14">

		<!-- Section head -->
		<div class="mb-10">
			<p class="mb-1 text-xs font-bold uppercase tracking-[0.18em]" style="color: var(--text-muted);">Features</p>
			<h2 class="font-extrabold leading-tight" style="font-size: var(--text-3xl); color: var(--text-main);">Six tools, one Pokédex.</h2>
		</div>

		<!-- Publication-style grid — gap becomes the divider line -->
		<div
			class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 overflow-hidden rounded-xl"
			style="gap: 1px; background-color: var(--border-color);"
		>
			{#each features as f}
				<a
					href={f.href}
					class="group flex flex-col gap-3 p-6 transition-colors duration-150"
					style="background-color: var(--bg-main);"
					onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-secondary)'}
					onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--bg-main)'}
				>
					<!-- Number chip -->
					<span
						class="font-mono text-xs font-bold"
						style="color: {f.color};"
					>{f.num}</span>

					<!-- Name + arrow -->
					<div class="flex items-center gap-2">
						<span class="text-base font-bold" style="color: var(--text-main);">{f.label}</span>
						<svg
							class="h-3.5 w-3.5 translate-x-0 opacity-0 transition-all duration-200 group-hover:translate-x-1 group-hover:opacity-100"
							fill="none" stroke="currentColor" viewBox="0 0 24 24"
							style="color: {f.color};"
						>
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" />
						</svg>
					</div>

					<!-- Description -->
					<p class="text-sm leading-relaxed" style="color: var(--text-muted);">{f.desc}</p>
				</a>
			{/each}
		</div>
	</div>
</section>

<!-- ─── Spotlight grid ────────────────────────────────────────────────────── -->
<section style="background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-14">

		<!-- Section head -->
		<div class="mb-8 flex items-baseline justify-between">
			<div>
				<p class="mb-1 text-xs font-bold uppercase tracking-[0.18em]" style="color: var(--text-muted);">Pokémon</p>
				<h2 class="font-extrabold leading-tight" style="font-size: var(--text-2xl); color: var(--text-main);">Spotlight</h2>
			</div>
			<a
				href="/search"
				class="group flex items-center gap-1 text-sm font-semibold transition-colors"
				style="color: var(--brand-red);"
			>
				All Pokémon
				<svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</a>
		</div>

		<!-- Uniform 4-col card grid -->
		{#if loading}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
				{#each Array.from({ length: 8 }) as _}
					<div
						class="h-44 animate-pulse rounded-2xl"
						style="background-color: var(--bg-secondary);"
					></div>
				{/each}
			</div>
		{:else}
			<div class="grid grid-cols-2 sm:grid-cols-4 gap-4 poke-stagger">
				{#each pokemons as pokemon}
					<a
						href="/pokemon/{pokemon.name}"
						class="group poke-enter block rounded-2xl p-4 transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
						style="background-color: {getTypeColor(pokemon.types[0].type.name)}cc;"
					>
						<!-- ID -->
						<p class="mb-0.5 text-[10px] font-bold uppercase tracking-widest text-white/60">
							#{pokemon.id.toString().padStart(3, '0')}
						</p>

						<!-- Name -->
						<h3 class="mb-2 text-sm font-bold capitalize leading-tight text-white">
							{pokemon.name}
						</h3>

						<!-- Type pills -->
						<div class="mb-3 flex flex-wrap gap-1">
							{#each pokemon.types as t}
								<span class="rounded-full bg-black/20 px-2 py-0.5 text-[10px] font-medium capitalize text-white/90">
									{t.type.name}
								</span>
							{/each}
						</div>

						<!-- Sprite -->
						<div class="flex justify-center">
							<img
								src={pokemon.sprites?.other?.['official-artwork']?.front_default ?? pokemon.sprites?.front_default ?? ''}
								alt={pokemon.name}
								class="h-20 w-20 object-contain drop-shadow-lg transition-transform duration-200 group-hover:scale-110"
								loading="lazy"
							/>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>

<!-- ─── Stats strip ───────────────────────────────────────────────────────── -->
<div class="border-t" style="border-color: var(--border-color); background-color: var(--bg-secondary);">
	<div class="mx-auto max-w-5xl px-6 py-10">
		<dl class="flex flex-wrap justify-center gap-x-16 gap-y-6 text-center">
			{#each [
				{ value: '1,025', label: 'Pokémon' },
				{ value: '18',    label: 'Types' },
				{ value: '9',     label: 'Generations' },
				{ value: '6',     label: 'Features' },
			] as stat}
				<div>
					<dt class="text-3xl font-extrabold tabular-nums" style="color: var(--brand-red); font-size: var(--text-4xl);">{stat.value}</dt>
					<dd class="mt-1 text-xs font-bold uppercase tracking-[0.15em]" style="color: var(--text-muted);">{stat.label}</dd>
				</div>
			{/each}
		</dl>
	</div>
</div>
