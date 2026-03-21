<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { ChevronLeft } from '$lib/icons';
	import FlavorChart from '../../../components/ui/FlavorChart.svelte';

	let { data }: { data: PageData } = $props();

	const displayName = $derived(
		data.item.name
			.split('-')
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ')
	);

	const englishEffect = $derived(data.item.effect_entries.find((e: { language: { name: string } }) => e.language.name === 'en'));
	const latestFlavorText = $derived(
		data.item.flavor_text_entries
			.filter((ft: { language: { name: string } }) => ft.language.name === 'en')
			.at(-1)?.text ?? ''
	);

	// Pocket-based hero color
	const POCKET_COLORS: Record<string, string> = {
		pokeballs:    '#dc2626',
		medicine:     '#16a34a',
		berries:      '#15803d',
		'hold-items': '#7c3aed',
		machines:     '#d97706',
		'key-items':  '#2563eb',
		collectibles: '#db2777',
		evolution:    '#0f766e',
		training:     '#ea580c'
	};

	function categoryToHeroColor(catName: string): string {
		for (const [k, v] of Object.entries(POCKET_COLORS)) {
			if (catName.toLowerCase().includes(k.replace('-', ''))) return v;
		}
		return '#6b7280';
	}
	const heroColor = $derived(categoryToHeroColor(data.item.category.name));

	function handleBack() {
		if (window.history.length > 1) history.back();
		else goto('/items');
	}
</script>

<svelte:head>
	<title>{displayName} — Pokédex Items</title>
	<meta name="description" content={englishEffect?.short_effect ?? `${displayName} item details`} />
</svelte:head>

<!-- Hero -->
<div class="relative overflow-hidden" style="background-color: {heroColor};">
	<!-- Pokéball decorative rings — clipped to right half to prevent arc bleeding onto left -->
	<div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
		<div class="absolute -right-16 -top-16 h-80 w-80 rounded-full border-[30px]" style="border-color: rgba(255,255,255,0.1);"></div>
		<div class="absolute -right-2 top-12 h-48 w-48 rounded-full border-[18px]" style="border-color: rgba(255,255,255,0.05);"></div>
	</div>

	<div class="relative mx-auto max-w-4xl px-5 pt-6 pb-10 sm:px-8 lg:px-12">
		<button
			onclick={handleBack}
			class="mb-5 flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
		>
			<ChevronLeft size={18} />
			Back
		</button>

		<div class="flex items-end gap-8">
			<!-- Sprite -->
			<div class="relative flex h-32 w-32 shrink-0 items-center justify-center rounded-3xl" style="background-color: rgba(255,255,255,0.15);">
				{#if data.item.sprites.default}
					<img
						src={data.item.sprites.default}
						alt={displayName}
						class="h-24 w-24 object-contain drop-shadow-2xl"
						width="96" height="96"
						loading="eager"
					/>
				{:else}
					<span class="text-6xl">📦</span>
				{/if}
			</div>

			<!-- Identity -->
			<div class="min-w-0 flex-1">
				<p class="mb-1 text-xs font-semibold uppercase tracking-widest text-white/60">
					{data.item.category.name.replace(/-/g, ' ')}
				</p>
				<h1 class="mb-3 text-4xl font-black leading-tight text-white lg:text-5xl">{displayName}</h1>
				<div class="flex flex-wrap items-center gap-3">
					<span class="rounded-full bg-white/20 px-4 py-1 text-sm font-semibold text-white">
					{#if data.item.cost === 0}Not for sale{:else}₽ {data.item.cost.toLocaleString()}{/if}
				</span>
				{#each data.item.attributes as attr}
						<span class="rounded-full bg-white/10 px-3 py-1 text-xs capitalize text-white/80">
							{attr.name.replace(/-/g, ' ')}
						</span>
					{/each}
				</div>
			</div>
		</div>
	</div>
</div>

<!-- Content -->
<div class="mx-auto max-w-4xl space-y-8 px-5 py-10 sm:px-8 lg:px-12">

	<!-- Effect -->
	{#if englishEffect}
		<section>
			<p class="mb-3 text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">Effect</p>
			<div class="rounded-2xl p-5" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
				<p class="text-sm leading-relaxed theme-text">{englishEffect.effect}</p>
			</div>
		</section>
	{/if}

	<!-- Berry flavor profile -->
	{#if data.berry}
		<section>
			<p class="mb-3 text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">Berry Flavor Profile</p>
			<div class="rounded-2xl p-5" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
				<FlavorChart flavors={data.berry.flavors} />
				<div class="mt-5 grid grid-cols-2 gap-4 border-t pt-5 sm:grid-cols-4" style="border-color: var(--border-color);">
					<div>
						<p class="text-xl font-bold theme-text">{data.berry.growth_time}h</p>
						<p class="text-xs" style="color: var(--text-muted);">Growth Time</p>
					</div>
					<div>
						<p class="text-xl font-bold theme-text">×{data.berry.max_harvest}</p>
						<p class="text-xs" style="color: var(--text-muted);">Max Harvest</p>
					</div>
					<div>
						<p class="text-xl font-bold theme-text">{data.berry.smoothness}</p>
						<p class="text-xs" style="color: var(--text-muted);">Smoothness</p>
					</div>
					<div>
						<p class="text-xl font-bold theme-text">{data.berry.natural_gift_power}</p>
						<p class="text-xs" style="color: var(--text-muted);">Natural Gift Power</p>
					</div>
				</div>
			</div>
		</section>
	{/if}

	<!-- Held by Pokémon -->
	{#if data.item.held_by_pokemon.length > 0}
		<section>
			<p class="mb-3 text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">
				Held by Pokémon ({data.item.held_by_pokemon.length})
			</p>
			<div class="flex flex-wrap gap-2">
				{#each data.item.held_by_pokemon as { pokemon }}
					<button
						onclick={() => goto(`/pokemon/${pokemon.name}`)}
						class="rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-colors hover:opacity-80"
						style="background-color: var(--bg-secondary); color: var(--text-main); border: 1px solid var(--border-color);"
					>
						{pokemon.name.replace(/-/g, ' ')}
					</button>
				{/each}
			</div>
		</section>
	{/if}

	<!-- Fling -->
	{#if data.item.fling_power}
		<section>
			<p class="mb-3 text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">Fling</p>
			<div class="rounded-2xl p-5" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
				<div class="flex items-center gap-6">
					<div>
						<p class="text-2xl font-bold theme-text">{data.item.fling_power}</p>
						<p class="text-xs" style="color: var(--text-muted);">Power</p>
					</div>
					{#if data.item.fling_effect}
						<div>
							<p class="text-sm font-medium capitalize theme-text">{data.item.fling_effect.name.replace(/-/g, ' ')}</p>
							<p class="text-xs" style="color: var(--text-muted);">Effect</p>
						</div>
					{/if}
				</div>
			</div>
		</section>
	{/if}

	<!-- Flavor Text -->
	{#if latestFlavorText}
		<section>
			<p class="mb-3 text-xs font-semibold uppercase tracking-widest" style="color: var(--text-muted);">Pokédex Entry</p>
			<div class="rounded-2xl p-5 italic" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary);">
				"{latestFlavorText}"
			</div>
		</section>
	{/if}

</div>
