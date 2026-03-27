<script lang="ts">
	import { Layers } from '$lib/icons';
	import type { TcgSeries, TcgSetBrief } from '$lib/types';

	let { data } = $props<{ data: { series: TcgSeries[] } }>();

	const series = $derived(data.series ?? []);

	function setCardCount(set: TcgSetBrief): string {
		const { total = 0, official = 0 } = set.cardCount ?? {};
		return official > 0 && official !== total ? `${official}/${total}` : `${total}`;
	}
</script>

<svelte:head>
	<title>Pokémon TCG – Pokédex</title>
	<meta name="description" content="Browse Pokémon Trading Card Game sets and cards from every series." />
</svelte:head>

<!-- ─── Hero ─────────────────────────────────────────────────────────────── -->
<section class="border-b" style="border-color: var(--border-color); background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-14">
		<div class="flex items-center gap-4 mb-3">
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl" style="background: var(--brand-red); color: #fff;">
				<Layers size={24} />
			</div>
			<div>
				<p class="text-xs font-bold uppercase tracking-[0.18em] mb-0.5" style="color: var(--text-muted);">Browse</p>
				<h1 class="font-extrabold leading-none tracking-tight" style="font-size: var(--text-3xl); color: var(--text-main);">
					Pokémon TCG
				</h1>
			</div>
		</div>
		<p class="max-w-xl text-base leading-relaxed mt-4" style="color: var(--text-secondary);">
			Explore every Trading Card Game set — from Base Set to the latest releases. Click any set to browse its cards.
		</p>
	</div>
</section>

<!-- ─── Series / Sets ─────────────────────────────────────────────────────── -->
<section style="background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-10">

		{#if series.length === 0}
			<div class="flex flex-col items-center justify-center py-24" style="color: var(--text-muted);">
				<Layers size={48} class="mb-4 opacity-30" />
				<p class="text-lg font-semibold">Could not load TCG data.</p>
				<p class="text-sm mt-1">Please try again later.</p>
			</div>
		{:else}
			{#each series as serie (serie.id)}
				<div class="mb-12">
					<!-- Series header -->
					<div class="mb-5 flex items-center gap-3">
						{#if serie.logo}
							<img
								src="{serie.logo}/logo.webp"
								alt={serie.name}
								class="h-8 object-contain"
								loading="lazy"
								onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
							/>
						{/if}
						<h2 class="text-xl font-extrabold" style="color: var(--text-main);">{serie.name}</h2>
						<span class="text-sm ml-1" style="color: var(--text-muted);">
							{serie.sets?.length ?? 0} set{serie.sets?.length !== 1 ? 's' : ''}
						</span>
					</div>

					<!-- Sets grid -->
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{#each (serie.sets ?? []) as set (set.id)}
							<a
								href="/tcg/sets/{set.id}"
								class="card-hover flex flex-col items-center gap-3 rounded-2xl p-4 text-center"
								style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								<!-- Set logo / symbol -->
								<div class="flex h-16 items-center justify-center">
									{#if set.logo}
										<img
											src="{set.logo}/logo.webp"
											alt={set.name}
											class="max-h-16 max-w-full object-contain"
											loading="lazy"
											onerror={(e) => {
												const img = e.currentTarget as HTMLImageElement;
												img.src = set.symbol ? `${set.symbol}/symbol.webp` : '';
												img.onerror = () => { img.style.display='none'; };
											}}
										/>
									{:else if set.symbol}
										<img
											src="{set.symbol}/symbol.webp"
											alt={set.name}
											class="h-10 w-10 object-contain"
											loading="lazy"
											onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
										/>
									{:else}
										<div class="h-10 w-10 rounded-full" style="background: var(--border-color);"></div>
									{/if}
								</div>

								<p class="text-sm font-semibold leading-tight" style="color: var(--text-main);">{set.name}</p>

								<!-- Card count badge -->
								<span
									class="rounded-full px-2.5 py-0.5 text-xs font-bold"
									style="background: var(--bg-main); color: var(--text-muted); border: 1px solid var(--border-color);"
								>
									{setCardCount(set)} cards
								</span>
							</a>
						{/each}
					</div>
				</div>
			{/each}
		{/if}

	</div>
</section>
