<script lang="ts">
	import CardImage from '../../../components/tcg/CardImage.svelte';
	import { goto } from '$app/navigation';
	import { Layers, Search, ChevronLeft, ChevronRight } from '#lib/icons';
	import type { PageData } from './$types';
	import { supportsValueFilters } from '#lib/utils/tcg-lang';
	import { CARD_CATEGORIES, CARD_SORT_FIELDS, DEFAULT_PAGE_SIZE } from '#lib/utils/tcg';

	let { data }: { data: PageData } = $props();

	const cards = $derived(data.cards ?? []);
	const query = $derived(data.query);

	// Local filter state (bound to inputs, submitted on form submit)
	// Use $effect to sync from server data on each navigation so inputs
	// stay in sync with the URL while remaining independently editable.
	let nameInput = $state('');
	let typesInput = $state('');
	let rarityInput = $state('');
	let categoryInput = $state('');
	let stageInput = $state('');
	let sortInput = $state('');
	let orderInput = $state('ASC');
	let hpMinInput = $state('');
	let hpMaxInput = $state('');

	$effect(() => {
		nameInput = query?.name ?? '';
		typesInput = query?.types ?? '';
		rarityInput = query?.rarity ?? '';
		categoryInput = query?.category ?? '';
		stageInput = query?.stage ?? '';
		sortInput = query?.sort ?? '';
		orderInput = query?.order ?? 'ASC';
		hpMinInput = query?.hpMin != null ? String(query.hpMin) : '';
		hpMaxInput = query?.hpMax != null ? String(query.hpMax) : '';
	});

	const valueFilters = $derived(supportsValueFilters(data.lang));
	const currentPage = $derived(query.page ?? 1);
	const hasNextPage = $derived(data.hasMore);
	const firstShown = $derived((currentPage - 1) * DEFAULT_PAGE_SIZE + 1);
	const hasPrevPage = $derived(currentPage > 1);

	const TCG_TYPES = [
		'Fire',
		'Water',
		'Grass',
		'Lightning',
		'Psychic',
		'Fighting',
		'Darkness',
		'Metal',
		'Dragon',
		'Fairy',
		'Colorless'
	];
	const STAGES = ['Basic', 'Stage1', 'Stage2', 'VMAX', 'VSTAR', 'V', 'MEGA', 'BREAK', 'Restored'];
	const RARITIES = [
		'Common',
		'Uncommon',
		'Rare',
		'Rare Holo',
		'Rare Holo EX',
		'Rare Holo GX',
		'Rare Holo V',
		'Rare Holo VMAX',
		'Ultra Rare',
		'Secret Rare',
		'Promo'
	];

	function buildUrl(overrides: Record<string, string | number | undefined> = {}): string {
		const params = new URLSearchParams();
		const filters = {
			q: nameInput || undefined,
			types: typesInput || undefined,
			rarity: rarityInput || undefined,
			category: categoryInput || undefined,
			stage: stageInput || undefined,
			sort: sortInput || undefined,
			order: sortInput && orderInput === 'DESC' ? 'DESC' : undefined,
			hpMin: hpMinInput || undefined,
			hpMax: hpMaxInput || undefined,
			page: '1',
			...overrides
		};
		for (const [k, v] of Object.entries(filters)) {
			if (v != null && v !== '') params.set(k, String(v));
		}
		return `/tcg/cards?${params.toString()}`;
	}

	function handleSearch(e: Event) {
		e.preventDefault();
		goto(buildUrl({ page: '1' }));
	}

	function handleClear() {
		nameInput = '';
		typesInput = '';
		rarityInput = '';
		categoryInput = '';
		stageInput = '';
		sortInput = '';
		orderInput = 'ASC';
		hpMinInput = '';
		hpMaxInput = '';
		goto('/tcg/cards');
	}

	function goToPage(p: number) {
		goto(buildUrl({ page: String(p) }));
	}
</script>

<svelte:head>
	<title>TCG Card Search – Pokédex</title>
	<meta name="description" content="Search Pokémon TCG cards by name, type, rarity and HP." />
</svelte:head>

<!-- ─── Header ───────────────────────────────────────────────────────────── -->
<section
	class="border-b"
	style="border-color: var(--border-color); background-color: var(--bg-main);"
>
	<div class="mx-auto max-w-5xl px-6 py-8">
		<div class="mb-2 flex items-center gap-3">
			<a href="/tcg" class="text-sm hover:underline" style="color: var(--text-muted);">TCG</a>
			<span style="color: var(--text-muted);">/</span>
			<span class="text-sm font-semibold" style="color: var(--text-main);">Search Cards</span>
		</div>
		<h1
			class="leading-tight font-extrabold"
			style="font-size: var(--text-2xl); color: var(--text-main);"
		>
			Card Search
		</h1>
	</div>
</section>

<!-- ─── Filters ───────────────────────────────────────────────────────────── -->
<section
	class="border-b"
	style="border-color: var(--border-color); background-color: var(--bg-secondary);"
>
	<div class="mx-auto max-w-5xl px-6 py-6">
		<form
			onsubmit={handleSearch}
			class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
		>
			<!-- Name -->
			<div class="flex flex-col gap-1">
				<label
					class="text-xs font-bold tracking-wider uppercase"
					style="color: var(--text-muted);"
					for="tcg-name">Pokémon Name</label
				>
				<input
					id="tcg-name"
					type="text"
					placeholder="e.g. Charizard"
					bind:value={nameInput}
					class="rounded-xl px-4 py-2.5 text-sm focus:outline-none"
					style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
				/>
			</div>

			<!-- Type -->
			<div class="flex flex-col gap-1">
				<label
					class="text-xs font-bold tracking-wider uppercase"
					style="color: var(--text-muted);"
					for="tcg-type">Type</label
				>
				<select
					id="tcg-type"
					disabled={!valueFilters}
					bind:value={typesInput}
					class="rounded-xl px-4 py-2.5 text-sm focus:outline-none"
					style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
				>
					<option value="">Any type</option>
					{#each TCG_TYPES as t (t)}
						<option value={t}>{t}</option>
					{/each}
				</select>
			</div>

			<!-- Rarity -->
			<div class="flex flex-col gap-1">
				<label
					class="text-xs font-bold tracking-wider uppercase"
					style="color: var(--text-muted);"
					for="tcg-rarity">Rarity</label
				>
				<select
					id="tcg-rarity"
					disabled={!valueFilters}
					bind:value={rarityInput}
					class="rounded-xl px-4 py-2.5 text-sm focus:outline-none"
					style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
				>
					<option value="">Any rarity</option>
					{#each RARITIES as r (r)}
						<option value={r}>{r}</option>
					{/each}
				</select>
			</div>

			<!-- Category -->
			<div class="flex flex-col gap-1">
				<label
					class="text-xs font-bold tracking-wider uppercase"
					style="color: var(--text-muted);"
					for="tcg-category">Category</label
				>
				<select
					id="tcg-category"
					disabled={!valueFilters}
					bind:value={categoryInput}
					class="rounded-xl px-4 py-2.5 text-sm focus:outline-none"
					style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
				>
					<option value="">Any category</option>
					{#each CARD_CATEGORIES as c (c)}
						<option value={c}>{c}</option>
					{/each}
				</select>
			</div>

			<!-- Stage -->
			<div class="flex flex-col gap-1">
				<label
					class="text-xs font-bold tracking-wider uppercase"
					style="color: var(--text-muted);"
					for="tcg-stage">Stage</label
				>
				<select
					id="tcg-stage"
					disabled={!valueFilters}
					bind:value={stageInput}
					class="rounded-xl px-4 py-2.5 text-sm focus:outline-none"
					style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
				>
					<option value="">Any stage</option>
					{#each STAGES as st (st)}
						<option value={st}>{st}</option>
					{/each}
				</select>
			</div>

			<!-- Sort -->
			<div class="flex flex-col gap-1">
				<label
					class="text-xs font-bold tracking-wider uppercase"
					style="color: var(--text-muted);"
					for="tcg-sort">Sort by</label
				>
				<div class="flex gap-2">
					<select
						id="tcg-sort"
						bind:value={sortInput}
						class="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
						style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						<option value="">Default</option>
						{#each CARD_SORT_FIELDS as f (f.id)}
							<option value={f.id}>{f.label}</option>
						{/each}
					</select>
					<select
						aria-label="Sort order"
						bind:value={orderInput}
						disabled={!sortInput}
						class="rounded-xl px-3 py-2.5 text-sm focus:outline-none disabled:opacity-50"
						style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						<option value="ASC">Asc</option>
						<option value="DESC">Desc</option>
					</select>
				</div>
			</div>

			<!-- HP range -->
			<fieldset class="m-0 flex flex-col gap-1 border-none p-0">
				<legend class="text-xs font-bold tracking-wider uppercase" style="color: var(--text-muted);"
					>HP Range</legend
				>
				<div class="flex items-center gap-2">
					<input
						type="number"
						placeholder="Min"
						min="0"
						max="330"
						aria-label="Minimum HP"
						bind:value={hpMinInput}
						class="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
						style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
					/>
					<span style="color: var(--text-muted);">–</span>
					<input
						type="number"
						placeholder="Max"
						min="0"
						max="330"
						aria-label="Maximum HP"
						bind:value={hpMaxInput}
						class="w-full rounded-xl px-3 py-2.5 text-sm focus:outline-none"
						style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
					/>
				</div>
			</fieldset>

			{#if !valueFilters}
				<p
					class="text-sm sm:col-span-2 md:col-span-3 lg:col-span-4"
					style="color: var(--text-secondary);"
				>
					Type, rarity, category and stage filters use English card data. Switch the card language
					to English to use them.
				</p>
			{/if}

			<!-- Actions row -->
			<div class="flex items-end gap-3 sm:col-span-2 md:col-span-3 lg:col-span-4">
				<button
					type="submit"
					class="btn-brand flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold"
				>
					<Search size={16} />
					Search
				</button>
				<button
					type="button"
					onclick={handleClear}
					class="rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-70"
					style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-muted);"
				>
					Clear
				</button>
			</div>
		</form>
	</div>
</section>

<!-- ─── Results ───────────────────────────────────────────────────────────── -->
<section style="background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-8">
		{#if cards.length === 0}
			<div
				class="flex flex-col items-center justify-center py-24"
				style="color: var(--text-muted);"
			>
				<Layers size={48} class="mb-4 opacity-30" />
				{#if data.failed}
					<p class="text-lg font-semibold">The card database is not responding.</p>
					<p class="mt-1 text-sm">Please try again in a moment.</p>
				{:else}
					<p class="text-lg font-semibold">No cards found.</p>
					<p class="mt-1 text-sm">Try adjusting your search filters.</p>
				{/if}
			</div>
		{:else}
			<div class="mb-5 flex items-center justify-between">
				<p class="text-sm" style="color: var(--text-muted);">
					{firstShown}–{firstShown + cards.length - 1} cards
				</p>
				<!-- Pagination top -->
				<div class="flex items-center gap-2">
					<button
						onclick={() => goToPage(currentPage - 1)}
						disabled={!hasPrevPage}
						aria-label="Previous page"
						class="rounded-lg px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-70 disabled:opacity-30"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						<ChevronLeft size={16} />
					</button>
					<span class="px-2 text-sm font-bold" style="color: var(--text-main);"
						>Page {currentPage}</span
					>
					<button
						onclick={() => goToPage(currentPage + 1)}
						disabled={!hasNextPage}
						aria-label="Next page"
						class="rounded-lg px-3 py-1.5 text-sm font-semibold transition-opacity hover:opacity-70 disabled:opacity-30"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						<ChevronRight size={16} />
					</button>
				</div>
			</div>

			<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
				{#each cards as card (card.id)}
					<a
						href="/tcg/cards/{card.id}"
						class="card-hover group flex flex-col items-center gap-2 rounded-xl p-2"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
						title="{card.name} #{card.localId}"
					>
						<CardImage
							image={card.image}
							alt={card.name}
							class="w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-105"
						/>
						<div class="w-full text-center">
							<p
								class="truncate text-xs leading-tight font-semibold"
								style="color: var(--text-main);"
							>
								{card.name}
							</p>
							<p class="text-[10px]" style="color: var(--text-muted);">#{card.localId}</p>
						</div>
					</a>
				{/each}
			</div>

			<!-- Pagination bottom -->
			{#if hasPrevPage || hasNextPage}
				<div class="mt-10 flex items-center justify-center gap-3">
					<button
						onclick={() => goToPage(currentPage - 1)}
						disabled={!hasPrevPage}
						class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-70 disabled:opacity-30"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						<ChevronLeft size={16} /> Previous
					</button>
					<span class="px-2 text-sm font-bold" style="color: var(--text-main);"
						>Page {currentPage}</span
					>
					<button
						onclick={() => goToPage(currentPage + 1)}
						disabled={!hasNextPage}
						class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-opacity hover:opacity-70 disabled:opacity-30"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						Next <ChevronRight size={16} />
					</button>
				</div>
			{/if}
		{/if}
	</div>
</section>
