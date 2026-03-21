<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { ChevronLeft } from '$lib/icons';

	let { data }: { data: PageData } = $props();

	const ability = $derived(data.ability);

	const displayName = $derived(
		ability.name
			.split('-')
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ')
	);

	const englishEffect = $derived(
		ability.effect_entries.find((e) => e.language.name === 'en')
	);

	const latestFlavorText = $derived(
		ability.flavor_text_entries
			.filter((ft) => ft.language.name === 'en')
			.at(-1)?.flavor_text ?? ''
	);

	// Split into normal and hidden-ability Pokémon
	const normalPokemon = $derived(
		ability.pokemon.filter((p) => !p.is_hidden)
	);
	const hiddenPokemon = $derived(
		ability.pokemon.filter((p) => p.is_hidden)
	);

	let showAllNormal = $state(false);
	let showAllHidden = $state(false);

	const normalVisible = $derived(
		showAllNormal ? normalPokemon : normalPokemon.slice(0, 20)
	);
	const hiddenVisible = $derived(
		showAllHidden ? hiddenPokemon : hiddenPokemon.slice(0, 20)
	);

	function handleBack() {
		if (window.history.length > 1) history.back();
		else goto('/search');
	}
</script>

<svelte:head>
	<title>{displayName} — Ability · Pokédex</title>
	<meta
		name="description"
		content={englishEffect?.short_effect ?? `${displayName} ability details`}
	/>
</svelte:head>

<!-- Hero -->
<div class="relative overflow-hidden" style="background-color: #7c3aed;">
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

		<div class="mb-2 flex items-center gap-2">
			<span class="rounded-full px-3 py-1 text-xs font-semibold" style="background-color: rgba(255,255,255,0.2); color: white;">
				Ability
			</span>
			{#if !ability.is_main_series}
				<span class="rounded-full px-3 py-1 text-xs font-semibold" style="background-color: rgba(255,255,255,0.15); color: rgba(255,255,255,0.8);">
					Non-main series
				</span>
			{/if}
		</div>
		<h1 class="text-3xl font-black text-white sm:text-4xl">{displayName}</h1>
		{#if englishEffect}
			<p class="mt-2 max-w-xl text-sm leading-relaxed text-white/80">{englishEffect.short_effect}</p>
		{/if}
	</div>
</div>

<!-- Body -->
<div class="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-12">

	<!-- Full effect -->
	{#if englishEffect?.effect}
		<div
			class="mb-6 rounded-2xl p-5"
			style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
		>
			<p class="mb-2 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">In-Battle Effect</p>
			<p class="text-sm leading-relaxed theme-text">{englishEffect.effect}</p>
		</div>
	{/if}

	<!-- Flavor text -->
	{#if latestFlavorText}
		<div
			class="mb-8 rounded-2xl p-5"
			style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
		>
			<p class="mb-2 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Game Description</p>
			<p class="text-sm italic leading-relaxed" style="color: var(--text-secondary);">{latestFlavorText}</p>
		</div>
	{/if}

	<!-- Normal ability Pokémon -->
	{#if normalPokemon.length > 0}
		<div class="mb-8">
			<p class="mb-4 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
				Normal Ability — {normalPokemon.length} Pokémon
			</p>
			<div class="flex flex-wrap gap-2">
				{#each normalVisible as entry}
					<button
						onclick={() => goto(`/pokemon/${entry.pokemon.name}`)}
						class="rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-all hover:-translate-y-px hover:shadow-md"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						{entry.pokemon.name.replace(/-/g, ' ')}
					</button>
				{/each}
			</div>
			{#if normalPokemon.length > 20}
				<button
					onclick={() => (showAllNormal = !showAllNormal)}
					class="mt-4 rounded-xl px-4 py-2 text-sm font-medium"
					style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary);"
				>
					{showAllNormal ? 'Show less ↑' : `Show all ${normalPokemon.length} ↓`}
				</button>
			{/if}
		</div>
	{/if}

	<!-- Hidden ability Pokémon -->
	{#if hiddenPokemon.length > 0}
		<div>
			<p class="mb-4 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
				Hidden Ability — {hiddenPokemon.length} Pokémon
			</p>
			<div class="flex flex-wrap gap-2">
				{#each hiddenVisible as entry}
					<button
						onclick={() => goto(`/pokemon/${entry.pokemon.name}`)}
						class="rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-all hover:-translate-y-px hover:shadow-md"
						style="background-color: #7c3aed15; border: 1px solid #7c3aed30; color: var(--text-main);"
					>
						{entry.pokemon.name.replace(/-/g, ' ')}
					</button>
				{/each}
			</div>
			{#if hiddenPokemon.length > 20}
				<button
					onclick={() => (showAllHidden = !showAllHidden)}
					class="mt-4 rounded-xl px-4 py-2 text-sm font-medium"
					style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary);"
				>
					{showAllHidden ? 'Show less ↑' : `Show all ${hiddenPokemon.length} ↓`}
				</button>
			{/if}
		</div>
	{/if}

</div>
