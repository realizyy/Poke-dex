<script lang="ts">
	import CardImage from '../../../../components/tcg/CardImage.svelte';
	import { Layers, ChevronLeft } from '#lib/icons';
	import type { TcgSet } from '#lib/types';
	import { collectionStore } from '#lib/stores/collection.svelte';
	import { setProgress } from '#lib/utils/collection';
	import { onMount } from 'svelte';

	let { data }: { data: { set: TcgSet } } = $props();
	const set = $derived(data.set);

	const cards = $derived(
		[...(set.cards ?? [])].sort((a, b) => {
			const aNum = parseInt(a.localId ?? '0') || 0;
			const bNum = parseInt(b.localId ?? '0') || 0;
			return aNum - bNum;
		})
	);

	onMount(() => collectionStore.load());

	type Filter = 'all' | 'owned' | 'missing' | 'wishlist';
	const FILTERS: { id: Filter; label: string }[] = [
		{ id: 'all', label: 'All' },
		{ id: 'owned', label: 'Owned' },
		{ id: 'missing', label: 'Missing' },
		{ id: 'wishlist', label: 'Wishlist' }
	];
	let filter = $state<Filter>('all');

	const progress = $derived(
		setProgress(collectionStore.entries, set.id, set.cardCount?.total ?? cards.length)
	);
	const visibleCards = $derived(
		cards.filter((card) => {
			const entry = collectionStore.get(card.id);
			if (filter === 'owned') return (entry?.owned ?? 0) > 0;
			if (filter === 'missing') return (entry?.owned ?? 0) === 0;
			if (filter === 'wishlist') return !!entry?.wishlisted;
			return true;
		})
	);

	function cardTotal(): string {
		const { total = 0, official = 0 } = set.cardCount ?? {};
		return official > 0 && official !== total
			? `${official} official / ${total} total`
			: `${total}`;
	}
</script>

<svelte:head>
	<title>{set.name ?? 'TCG Set'} – Pokémon TCG – Pokédex</title>
	<meta name="description" content="Browse all cards in {set.name}." />
</svelte:head>

<!-- ─── Back + Header ─────────────────────────────────────────────────────── -->
<section
	class="border-b"
	style="border-color: var(--border-color); background-color: var(--bg-main);"
>
	<div class="mx-auto max-w-5xl px-6 py-8">
		<a
			href="/tcg"
			class="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
			style="color: var(--text-muted);"
		>
			<ChevronLeft size={16} />
			All Sets
		</a>

		<div class="flex flex-wrap items-center gap-6">
			<!-- Set logo -->
			{#if set.logo}
				<img
					src="{set.logo}/logo.webp"
					alt={set.name}
					class="h-20 object-contain"
					loading="eager"
					onerror={(e) => {
						(e.currentTarget as HTMLImageElement).style.display = 'none';
					}}
				/>
			{/if}

			<div class="min-w-0 flex-1">
				<div class="mb-1 flex items-center gap-2">
					{#if set.symbol}
						<img
							src="{set.symbol}/symbol.webp"
							alt=""
							aria-hidden="true"
							class="h-6 w-6 object-contain"
							loading="eager"
							onerror={(e) => {
								(e.currentTarget as HTMLImageElement).style.display = 'none';
							}}
						/>
					{/if}
					{#if set.serie}
						<span
							class="text-xs font-bold tracking-widest uppercase"
							style="color: var(--text-muted);">{set.serie}</span
						>
					{/if}
				</div>
				<h1
					class="leading-tight font-extrabold"
					style="font-size: var(--text-2xl); color: var(--text-main);"
				>
					{set.name}
				</h1>
				<div class="mt-2 flex flex-wrap gap-3 text-sm" style="color: var(--text-secondary);">
					<span>{cardTotal()} cards</span>
					{#if set.releaseDate}
						<span>·</span>
						<span>Released {set.releaseDate}</span>
					{/if}
				</div>
			</div>
		</div>
	</div>
</section>

<!-- ─── Cards grid ────────────────────────────────────────────────────────── -->
<section style="background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-10">
		{#if cards.length === 0}
			<div
				class="flex flex-col items-center justify-center py-24"
				style="color: var(--text-muted);"
			>
				<Layers size={48} class="mb-4 opacity-30" />
				<p class="text-lg font-semibold">No cards found in this set.</p>
			</div>
		{:else}
			<div
				class="mb-6 rounded-2xl p-4"
				style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
			>
				<div class="mb-2 flex items-center justify-between text-sm">
					<span class="font-semibold" style="color: var(--text-main);">
						Collection: {progress.owned} / {progress.total} cards ({progress.percent}%)
					</span>
					<a href="/tcg/collection" class="hover:underline" style="color: var(--brand-red);">
						My collection
					</a>
				</div>
				<div
					class="h-2 w-full overflow-hidden rounded-full"
					style="background-color: var(--bg-tertiary);"
					role="progressbar"
					aria-label="Set completion"
					aria-valuemin="0"
					aria-valuemax="100"
					aria-valuenow={progress.percent}
				>
					<div
						class="h-2 rounded-full transition-all duration-500"
						style="width: {progress.percent}%; background-color: var(--brand-red);"
					></div>
				</div>
			</div>

			<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
				<p class="text-sm" style="color: var(--text-muted);">
					{visibleCards.length} of {cards.length} card{cards.length !== 1 ? 's' : ''}
				</p>
				<div class="flex gap-2" role="group" aria-label="Filter cards by collection status">
					{#each FILTERS as f (f.id)}
						<button
							onclick={() => (filter = f.id)}
							aria-pressed={filter === f.id}
							class="rounded-full px-3 py-1 text-sm font-semibold transition-colors"
							style={filter === f.id
								? 'background: var(--brand-red); color: white;'
								: 'background: var(--bg-secondary); color: var(--text-main); border: 1px solid var(--border-color);'}
						>
							{f.label}
						</button>
					{/each}
				</div>
			</div>
			<div class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
				{#each visibleCards as card (card.id)}
					{@const entry = collectionStore.get(card.id)}
					<a
						href="/tcg/cards/{card.id}"
						class="card-hover group flex flex-col items-center gap-2 rounded-xl p-2"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
						title="{card.name} #{card.localId}"
					>
						<CardImage
							image={card.image}
							alt="{card.name} #{card.localId}"
							class="w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-105"
						/>
						<div class="w-full text-center">
							<p
								class="truncate text-xs leading-tight font-semibold"
								style="color: var(--text-main);"
							>
								{card.name}
							</p>
							<p class="text-[10px]" style="color: var(--text-muted);">
								#{card.localId}{#if entry?.owned}
									· Owned ×{entry.owned}{/if}{#if entry?.wishlisted}
									· Wishlist{/if}
							</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
