<script lang="ts">
	import SetCard from '../../../../components/tcg/SetCard.svelte';
	import type { PageData } from './$types';

	let { data }: { data: PageData } = $props();
	const serie = $derived(data.serie);
	const sets = $derived([...serie.sets].reverse());
	const released = $derived(
		serie.releaseDate
			? new Date(serie.releaseDate).toLocaleDateString('en', {
					year: 'numeric',
					month: 'long',
					day: 'numeric'
				})
			: null
	);
</script>

<svelte:head>
	<title>{serie.name} – Pokémon TCG – Pokédex</title>
	<meta
		name="description"
		content="All {serie.sets.length} Pokémon TCG sets in the {serie.name} series."
	/>
</svelte:head>

<section
	class="border-b"
	style="border-color: var(--border-color); background-color: var(--bg-main);"
>
	<div class="mx-auto max-w-5xl px-6 py-8">
		<nav class="mb-3 flex items-center gap-3 text-sm" style="color: var(--text-muted);">
			<a href="/tcg" class="hover:underline">TCG</a>
			<span>/</span>
			<span class="font-semibold" style="color: var(--text-main);">{serie.name}</span>
		</nav>
		<div class="flex items-center gap-4">
			{#if serie.logo}
				<img
					src="{serie.logo}.webp"
					alt=""
					class="h-12 object-contain"
					onerror={(e) => {
						(e.currentTarget as HTMLImageElement).style.display = 'none';
					}}
				/>
			{/if}
			<div>
				<h1 class="font-extrabold" style="font-size: var(--text-2xl); color: var(--text-main);">
					{serie.name}
				</h1>
				<p class="text-sm" style="color: var(--text-secondary);">
					{serie.sets.length} set{serie.sets.length === 1 ? '' : 's'}{released
						? ` · first released ${released}`
						: ''}
				</p>
			</div>
		</div>
	</div>
</section>

<section style="background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-10">
		<div class="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
			{#each sets as set (set.id)}
				<SetCard {set} />
			{/each}
		</div>
	</div>
</section>
