<script lang="ts">
	import type { TcgSetBrief } from '#lib/types';

	let { set }: { set: TcgSetBrief } = $props();

	const cardCount = $derived.by(() => {
		const { total = 0, official = 0 } = set.cardCount ?? {};
		return official > 0 && official !== total ? `${official}/${total}` : `${total}`;
	});
</script>

<a
	href="/tcg/sets/{set.id}"
	class="card-hover flex flex-col items-center gap-3 rounded-2xl p-4 text-center"
	style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
>
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
					img.onerror = () => {
						img.style.display = 'none';
					};
				}}
			/>
		{:else if set.symbol}
			<img
				src="{set.symbol}/symbol.webp"
				alt={set.name}
				class="h-10 w-10 object-contain"
				loading="lazy"
				onerror={(e) => {
					(e.currentTarget as HTMLImageElement).style.display = 'none';
				}}
			/>
		{:else}
			<div class="h-10 w-10 rounded-full" style="background: var(--border-color);"></div>
		{/if}
	</div>

	<p class="text-sm leading-tight font-semibold" style="color: var(--text-main);">{set.name}</p>

	<span
		class="rounded-full px-2.5 py-0.5 text-xs font-bold"
		style="background: var(--bg-main); color: var(--text-muted); border: 1px solid var(--border-color);"
	>
		{cardCount} cards
	</span>
</a>
