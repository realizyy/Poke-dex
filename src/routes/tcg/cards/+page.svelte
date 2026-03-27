<script lang="ts">
	import { goto } from '$app/navigation';
	import { Layers, Search, ChevronLeft, ChevronRight } from '$lib/icons';
	import { TcgService } from '$lib/services/tcg-service';
	import type { TcgCardBrief } from '$lib/types';

	let { data } = $props<{ data: { cards: TcgCardBrief[]; query: { name: string; types: string; rarity: string; hpMin?: number; hpMax?: number; setId: string; page: number; } } }>();

	const cards = $derived(data.cards ?? []);
	const query = $derived(data.query);

	// Local filter state (bound to inputs, submitted on form submit)
	// Use $effect to sync from server data on each navigation so inputs
	// stay in sync with the URL while remaining independently editable.
	let nameInput = $state('');
	let typesInput = $state('');
	let rarityInput = $state('');
	let hpMinInput = $state('');
	let hpMaxInput = $state('');

	$effect(() => {
		nameInput = query?.name ?? '';
		typesInput = query?.types ?? '';
		rarityInput = query?.rarity ?? '';
		hpMinInput = query?.hpMin != null ? String(query.hpMin) : '';
		hpMaxInput = query?.hpMax != null ? String(query.hpMax) : '';
	});

	const currentPage = $derived(query.page ?? 1);
	const hasNextPage = $derived(cards.length === 24);
	const hasPrevPage = $derived(currentPage > 1);

	const TCG_TYPES = ['Fire','Water','Grass','Lightning','Psychic','Fighting','Darkness','Metal','Dragon','Fairy','Colorless'];
	const RARITIES = ['Common','Uncommon','Rare','Rare Holo','Rare Holo EX','Rare Holo GX','Rare Holo V','Rare Holo VMAX','Ultra Rare','Secret Rare','Promo'];

	function buildUrl(overrides: Record<string, string | number | undefined> = {}): string {
		const params = new URLSearchParams();
		const filters = {
			q: nameInput || undefined,
			types: typesInput || undefined,
			rarity: rarityInput || undefined,
			hpMin: hpMinInput || undefined,
			hpMax: hpMaxInput || undefined,
			page: '1',
			...overrides,
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
<section class="border-b" style="border-color: var(--border-color); background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-8">
		<div class="flex items-center gap-3 mb-2">
			<a href="/tcg" class="text-sm hover:underline" style="color: var(--text-muted);">TCG</a>
			<span style="color: var(--text-muted);">/</span>
			<span class="text-sm font-semibold" style="color: var(--text-main);">Search Cards</span>
		</div>
		<h1 class="font-extrabold leading-tight" style="font-size: var(--text-2xl); color: var(--text-main);">Card Search</h1>
	</div>
</section>

<!-- ─── Filters ───────────────────────────────────────────────────────────── -->
<section class="border-b" style="border-color: var(--border-color); background-color: var(--bg-secondary);">
	<div class="mx-auto max-w-5xl px-6 py-6">
		<form onsubmit={handleSearch} class="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
			<!-- Name -->
			<div class="flex flex-col gap-1">
				<label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);" for="tcg-name">Pokémon Name</label>
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
				<label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);" for="tcg-type">Type</label>
				<select
					id="tcg-type"
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
				<label class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);" for="tcg-rarity">Rarity</label>
				<select
					id="tcg-rarity"
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

			<!-- HP range -->
			<fieldset class="flex flex-col gap-1 border-none p-0 m-0">
				<legend class="text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">HP Range</legend>
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

			<!-- Actions row -->
			<div class="flex items-end gap-3 sm:col-span-2 md:col-span-3 lg:col-span-4">
				<button type="submit" class="btn-brand flex items-center gap-2 rounded-xl px-6 py-2.5 text-sm font-semibold">
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
			<div class="flex flex-col items-center justify-center py-24" style="color: var(--text-muted);">
				<Layers size={48} class="mb-4 opacity-30" />
				<p class="text-lg font-semibold">No cards found.</p>
				<p class="text-sm mt-1">Try adjusting your search filters.</p>
			</div>
		{:else}
			<div class="mb-5 flex items-center justify-between">
				<p class="text-sm" style="color: var(--text-muted);">
					{cards.length === 24 ? `${(currentPage - 1) * 24 + 1}–${currentPage * 24}+` : `${(currentPage - 1) * 24 + 1}–${(currentPage - 1) * 24 + cards.length}`} cards
				</p>
				<!-- Pagination top -->
				<div class="flex items-center gap-2">
					<button
						onclick={() => goToPage(currentPage - 1)}
						disabled={!hasPrevPage}
						class="rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-30 transition-opacity hover:opacity-70"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						<ChevronLeft size={16} />
					</button>
					<span class="text-sm font-bold px-2" style="color: var(--text-main);">Page {currentPage}</span>
					<button
						onclick={() => goToPage(currentPage + 1)}
						disabled={!hasNextPage}
						class="rounded-lg px-3 py-1.5 text-sm font-semibold disabled:opacity-30 transition-opacity hover:opacity-70"
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
						{#if card.image}
							<img
								src="{TcgService.cardImageUrl(card.image, 'low')}"
								alt="{card.name}"
								class="w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-105"
								loading="lazy"
								width="200" height="280"
								onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
							/>
						{:else}
							<div class="w-full aspect-[5/7] rounded-lg flex items-center justify-center" style="background: var(--bg-main);">
								<Layers size={28} class="opacity-20" />
							</div>
						{/if}
						<div class="w-full text-center">
							<p class="truncate text-xs font-semibold leading-tight" style="color: var(--text-main);">{card.name}</p>
							<p class="text-[10px]" style="color: var(--text-muted);">#{card.localId}</p>
						</div>
					</a>
				{/each}
			</div>

			<!-- Pagination bottom -->
			{#if hasPrevPage || hasNextPage}
				<div class="flex items-center justify-center gap-3 mt-10">
					<button
						onclick={() => goToPage(currentPage - 1)}
						disabled={!hasPrevPage}
						class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-30 transition-opacity hover:opacity-70"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						<ChevronLeft size={16} /> Previous
					</button>
					<span class="text-sm font-bold px-2" style="color: var(--text-main);">Page {currentPage}</span>
					<button
						onclick={() => goToPage(currentPage + 1)}
						disabled={!hasNextPage}
						class="flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold disabled:opacity-30 transition-opacity hover:opacity-70"
						style="background: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						Next <ChevronRight size={16} />
					</button>
				</div>
			{/if}
		{/if}
	</div>
</section>
