<script lang="ts">
	import { Layers } from '#lib/icons';
	import SetCard from '../../components/tcg/SetCard.svelte';
	import type { TcgSeriesDetail } from '#lib/types';

	let { data }: { data: { series: TcgSeriesDetail[] } } = $props();

	const series = $derived(data.series ?? []);
</script>

<svelte:head>
	<title>Pokémon TCG – Pokédex</title>
	<meta
		name="description"
		content="Browse Pokémon Trading Card Game sets and cards from every series."
	/>
</svelte:head>

<!-- ─── Hero ─────────────────────────────────────────────────────────────── -->
<section
	class="border-b"
	style="border-color: var(--border-color); background-color: var(--bg-main);"
>
	<div class="mx-auto max-w-5xl px-6 py-14">
		<div class="mb-3 flex items-center gap-4">
			<div
				class="flex h-12 w-12 items-center justify-center rounded-2xl"
				style="background: var(--brand-red); color: #fff;"
			>
				<Layers size={24} />
			</div>
			<div>
				<p
					class="mb-0.5 text-xs font-bold tracking-[0.18em] uppercase"
					style="color: var(--text-muted);"
				>
					Browse
				</p>
				<h1
					class="leading-none font-extrabold tracking-tight"
					style="font-size: var(--text-3xl); color: var(--text-main);"
				>
					Pokémon TCG
				</h1>
			</div>
		</div>
		<p class="mt-4 max-w-xl text-base leading-relaxed" style="color: var(--text-secondary);">
			Explore every Trading Card Game set — from Base Set to the latest releases. Click any set to
			browse its cards.
		</p>
	</div>
</section>

<!-- ─── Series / Sets ─────────────────────────────────────────────────────── -->
<section style="background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-10">
		{#if series.length === 0}
			<div
				class="flex flex-col items-center justify-center py-24"
				style="color: var(--text-muted);"
			>
				<Layers size={48} class="mb-4 opacity-30" />
				<p class="text-lg font-semibold">Could not load TCG data.</p>
				<p class="mt-1 text-sm">Please try again later.</p>
			</div>
		{:else}
			{#each series as serie (serie.id)}
				<div class="mb-12">
					<!-- Series header -->
					<div class="mb-5 flex items-center gap-3">
						{#if serie.logo}
							<img
								src="{serie.logo}.webp"
								alt={serie.name}
								class="h-8 object-contain"
								loading="lazy"
								onerror={(e) => {
									(e.currentTarget as HTMLImageElement).style.display = 'none';
								}}
							/>
						{/if}
						<h2 class="text-xl font-extrabold">
							<a
								href="/tcg/series/{serie.id}"
								class="hover:underline"
								style="color: var(--text-main);">{serie.name}</a
							>
						</h2>
						<span class="ml-1 text-sm" style="color: var(--text-muted);">
							{serie.sets?.length ?? 0} set{serie.sets?.length !== 1 ? 's' : ''}
						</span>
					</div>

					<!-- Sets grid -->
					<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
						{#each [...serie.sets].reverse() as set (set.id)}
							<SetCard {set} />
						{/each}
					</div>
				</div>
			{/each}
		{/if}
	</div>
</section>
