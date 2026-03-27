<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import type { Pokemon } from '$lib/types';
	import type { TcgSetBrief } from '$lib/types';
	import { page } from '$app/stores';
	import { get } from 'svelte/store';
	import { getTypeColor } from '$lib/utils/pokemon-utils';

	let pokemons: Pokemon[] = [];
	let featuredSets: TcgSetBrief[] = [];
	let loading = true;
	let searchQuery = '';

	onMount(() => {
		heroMon = HERO_POOL[Math.floor(Math.random() * HERO_POOL.length)];
		const data = get(page).data;
		pokemons = data.pokemons ?? [];
		featuredSets = data.featuredSets ?? [];
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

	// Curated pool for the hero illustration — each entry carries a matching glow colour
	const HERO_POOL = [
		{ id: 6,   name: 'Charizard', glow: 'rgba(239,68,68,0.15)'  },
		{ id: 25,  name: 'Pikachu',   glow: 'rgba(234,179,8,0.15)'  },
		{ id: 94,  name: 'Gengar',    glow: 'rgba(139,92,246,0.15)' },
		{ id: 131, name: 'Lapras',    glow: 'rgba(59,130,246,0.15)' },
		{ id: 149, name: 'Dragonite', glow: 'rgba(99,102,241,0.15)' },
		{ id: 150, name: 'Mewtwo',    glow: 'rgba(139,92,246,0.15)' },
		{ id: 245, name: 'Suicune',   glow: 'rgba(59,130,246,0.15)' },
		{ id: 249, name: 'Lugia',     glow: 'rgba(99,102,241,0.12)' },
		{ id: 282, name: 'Gardevoir', glow: 'rgba(236,72,153,0.15)' },
		{ id: 384, name: 'Rayquaza',  glow: 'rgba(34,197,94,0.15)'  },
		{ id: 448, name: 'Lucario',   glow: 'rgba(59,130,246,0.15)' },
		{ id: 658, name: 'Greninja',  glow: 'rgba(59,130,246,0.15)' },
		{ id: 700, name: 'Sylveon',   glow: 'rgba(236,72,153,0.15)' },
		{ id: 888, name: 'Zacian',    glow: 'rgba(96,165,250,0.15)' },
	];
	let heroMon = HERO_POOL[0];
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

			<!-- Right: hero Pokémon illustration (random each mount) -->
			<div class="hidden md:flex items-center justify-center">
				<div class="relative flex h-56 w-56 items-center justify-center rounded-full"
					style="background: radial-gradient(circle, {heroMon.glow} 0%, transparent 70%);">
					<img
						src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/{heroMon.id}.png"
						alt={heroMon.name}
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

<!-- ─── TCG Featured Sets ─────────────────────────────────────────────────── -->
{#if featuredSets.length > 0}
<section class="border-t" style="border-color: var(--border-color); background-color: var(--bg-secondary);">
	<div class="mx-auto max-w-5xl px-6 py-14">
		<div class="mb-8 flex items-baseline justify-between">
			<div>
				<p class="mb-1 text-xs font-bold uppercase tracking-[0.18em]" style="color: var(--text-muted);">Trading Card Game</p>
				<h2 class="font-extrabold leading-tight" style="font-size: var(--text-2xl); color: var(--text-main);">Latest Sets</h2>
			</div>
			<a
				href="/tcg"
				class="group flex items-center gap-1 text-sm font-semibold transition-colors"
				style="color: var(--brand-red);"
			>
				All Sets
				<svg class="h-4 w-4 transition-transform group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
				</svg>
			</a>
		</div>
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each featuredSets as set (set.id)}
				<a
					href="/tcg/sets/{set.id}"
					class="group flex flex-col items-center gap-3 rounded-2xl p-5 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-hover)]"
					style="background-color: var(--bg-main); border: 1px solid var(--border-color);"
				>
					<div class="flex h-16 items-center justify-center">
						{#if set.logo}
							<img
								src="{set.logo}/logo.webp"
								alt={set.name}
								class="max-h-16 max-w-full object-contain transition-transform duration-200 group-hover:scale-105"
								loading="lazy"
								onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
							/>
						{:else if set.symbol}
							<img
								src="{set.symbol}/symbol.webp"
								alt={set.name}
								class="h-12 w-12 object-contain"
								loading="lazy"
								onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
							/>
						{/if}
					</div>
					<p class="text-sm font-bold leading-tight" style="color: var(--text-main);">{set.name}</p>
					<span
						class="rounded-full px-2.5 py-0.5 text-xs font-bold"
						style="background: var(--bg-secondary); color: var(--text-muted); border: 1px solid var(--border-color);"
					>
						{set.cardCount?.official ?? set.cardCount?.total ?? 0} cards
					</span>
				</a>
			{/each}
		</div>
	</div>
</section>
{/if}

<!-- ─── Footer ──────────────────────────────────────────────────────────── -->
<footer class="border-t" style="border-color: var(--border-color); background-color: var(--bg-secondary);">
	<div class="relative overflow-hidden">

		<!-- Silhouette decoration: Snorlax, bottom-right, very faint -->
		<div class="pointer-events-none absolute bottom-0 right-0 select-none" aria-hidden="true">
			<img
				src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/143.png"
				alt=""
				class="h-72 w-72 object-contain"
				style="filter: brightness(0) opacity(0.055); transform: scaleX(-1);"
				loading="lazy"
			/>
		</div>

		<div class="relative mx-auto max-w-5xl px-6 py-14">
			<!-- 3-column grid -->
			<div class="grid grid-cols-1 gap-10 sm:grid-cols-3">

				<!-- Col 1: Brand -->
				<div>
					<div class="mb-4 flex items-center gap-2.5">
						<img src="/poke_1.png" alt="" class="h-7 w-7 rounded-full object-contain" />
						<span class="font-bold" style="color: var(--text-main);">Pokédex</span>
					</div>
					<p class="mb-6 max-w-xs text-sm leading-relaxed" style="color: var(--text-muted);">
						A fan-built Pokédex for trainers everywhere. Explore stats, build teams and simulate battles.
					</p>
					<a
						href="https://pokeapi.co"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-75"
						style="background-color: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-muted);"
					>
						<svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
							<circle cx="12" cy="12" r="10" stroke-width="2"/>
							<path d="M2 12h20M12 2a15 15 0 010 20M12 2a15 15 0 000 20" stroke-width="2"/>
						</svg>
						Powered by PokeAPI
					</a>
				</div>

				<!-- Col 2: Explore links (reuses `features` array) -->
				<div>
					<p class="mb-4 text-xs font-bold uppercase tracking-[0.15em]" style="color: var(--text-muted);">Explore</p>
					<ul class="space-y-2.5">
						{#each features as f}
							<li>
								<a
									href={f.href}
									class="flex items-center gap-2 text-sm transition-colors hover:underline"
									style="color: var(--text-secondary);"
								>
									<span class="h-1.5 w-1.5 rounded-full flex-shrink-0" style="background-color: {f.color};"></span>
									{f.label}
								</a>
							</li>
						{/each}
					</ul>
				</div>

				<!-- Col 3: By the numbers -->
				<div>
					<p class="mb-4 text-xs font-bold uppercase tracking-[0.15em]" style="color: var(--text-muted);">By the numbers</p>
					<ul class="space-y-3">
						{#each [
							{ value: '1,025', label: 'Pokémon indexed'   },
							{ value: '18',    label: 'Types covered'     },
							{ value: '9',     label: 'Generations'       },
							{ value: '905+',  label: 'Moves in database' },
							{ value: '6',     label: 'Built-in tools'    },
						] as stat}
							<li class="flex items-baseline gap-3">
								<span class="w-12 text-right font-bold tabular-nums" style="color: var(--brand-red);">{stat.value}</span>
								<span class="text-xs" style="color: var(--text-muted);">{stat.label}</span>
							</li>
						{/each}
					</ul>
				</div>

			</div>

			<!-- Bottom strip -->
			<div
				class="mt-10 flex flex-wrap items-center justify-between gap-3 border-t pt-6"
				style="border-color: var(--border-color);"
			>
				<p class="text-xs" style="color: var(--text-muted);">
					Not affiliated with Nintendo, Game Freak, or The Pokémon Company. Pokémon and all related names are trademarks of their respective owners.
				</p>
				<p class="text-xs" style="color: var(--text-muted);">
					Data via <a href="https://pokeapi.co" target="_blank" rel="noopener noreferrer" class="underline hover:opacity-75">PokeAPI</a>
				</p>
			</div>
		</div>
	</div>
</footer>
