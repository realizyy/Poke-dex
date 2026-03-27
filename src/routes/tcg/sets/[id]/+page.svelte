<script lang="ts">
	import { Layers, ChevronLeft } from '$lib/icons';
	import type { TcgSet, TcgCardBrief } from '$lib/types';
	import { TcgService } from '$lib/services/tcg-service';

	let { data } = $props<{ data: { set: TcgSet } }>();
	const set = $derived(data.set);

	const rarityOrder = [
		'Common', 'Uncommon', 'Rare', 'Rare Holo', 'Rare Holo EX', 'Rare Holo GX',
		'Rare Holo V', 'Rare Holo VMAX', 'Rare Holo VSTAR',
		'Ultra Rare', 'Secret Rare', 'Amazing Rare', 'Promo',
	];

	function rarityRank(r?: string) {
		const idx = rarityOrder.indexOf(r ?? '');
		return idx === -1 ? 99 : idx;
	}

	const cards = $derived(
		[...(set.cards ?? [])].sort((a, b) => {
			const aNum = parseInt(a.localId ?? '0') || 0;
			const bNum = parseInt(b.localId ?? '0') || 0;
			return aNum - bNum;
		})
	);

	function cardTotal(): string {
		const { total = 0, official = 0 } = set.cardCount ?? {};
		return official > 0 && official !== total ? `${official} official / ${total} total` : `${total}`;
	}
</script>

<svelte:head>
	<title>{set.name ?? 'TCG Set'} – Pokémon TCG – Pokédex</title>
	<meta name="description" content="Browse all cards in {set.name}." />
</svelte:head>

<!-- ─── Back + Header ─────────────────────────────────────────────────────── -->
<section class="border-b" style="border-color: var(--border-color); background-color: var(--bg-main);">
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
					onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
				/>
			{/if}

			<div class="flex-1 min-w-0">
				<div class="flex items-center gap-2 mb-1">
					{#if set.symbol}
						<img
							src="{set.symbol}/symbol.webp"
							alt=""
							aria-hidden="true"
							class="h-6 w-6 object-contain"
							loading="eager"
							onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
						/>
					{/if}
					{#if set.serie}
						<span class="text-xs font-bold uppercase tracking-widest" style="color: var(--text-muted);">{set.serie}</span>
					{/if}
				</div>
				<h1 class="font-extrabold leading-tight" style="font-size: var(--text-2xl); color: var(--text-main);">
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
			<div class="flex flex-col items-center justify-center py-24" style="color: var(--text-muted);">
				<Layers size={48} class="mb-4 opacity-30" />
				<p class="text-lg font-semibold">No cards found in this set.</p>
			</div>
		{:else}
			<p class="mb-6 text-sm" style="color: var(--text-muted);">{cards.length} card{cards.length !== 1 ? 's' : ''}</p>
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
								alt="{card.name} #{card.localId}"
								class="w-full rounded-lg object-contain transition-transform duration-200 group-hover:scale-105"
								loading="lazy"
								width="200" height="280"
								onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
							/>
						{:else}
							<div class="w-full aspect-[5/7] rounded-lg flex items-center justify-center" style="background: var(--bg-main);">
								<Layers size={32} class="opacity-20" />
							</div>
						{/if}
						<div class="w-full text-center">
							<p class="truncate text-xs font-semibold leading-tight" style="color: var(--text-main);">{card.name}</p>
							<p class="text-[10px]" style="color: var(--text-muted);">#{card.localId}</p>
						</div>
					</a>
				{/each}
			</div>
		{/if}
	</div>
</section>
