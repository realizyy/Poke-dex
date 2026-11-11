<script lang="ts">
	import type { TcgSetBrief } from '#lib/types';

	let { set }: { set: TcgSetBrief } = $props();

	const cardCount = $derived.by(() => {
		const { total = 0, official = 0 } = set.cardCount ?? {};
		return official > 0 && official !== total ? `${official}/${total}` : `${total}`;
	});

	/** Artwork to try, in order. The API gives logo and symbol URLs without a file extension. */
	const sources = $derived(
		[set.logo ? `${set.logo}.webp` : null, set.symbol ?? null].filter((url): url is string => !!url)
	);
	let failedCount = $state(0);
	let shownSetId = $state('');
	$effect(() => {
		if (set.id !== shownSetId) {
			shownSetId = set.id;
			failedCount = 0;
		}
	});
	const current = $derived(sources[failedCount]);
	const initials = $derived(
		set.name
			.split(/\s+/)
			.filter(Boolean)
			.slice(0, 3)
			.map((word) => word.charAt(0).toUpperCase())
			.join('')
	);
</script>

<a
	href="/tcg/sets/{set.id}"
	class="card-hover flex flex-col items-center gap-3 rounded-2xl p-4 text-center"
	style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
>
	<div class="flex h-16 items-center justify-center">
		{#if current}
			<img
				src={current}
				alt={set.name}
				class="max-h-16 max-w-full object-contain {failedCount === 0 && set.logo
					? ''
					: 'h-12 w-12'}"
				loading="lazy"
				onerror={() => failedCount++}
			/>
		{:else}
			<div
				class="flex h-14 w-14 items-center justify-center rounded-full text-sm font-extrabold"
				style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-secondary);"
				aria-hidden="true"
			>
				{initials}
			</div>
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
