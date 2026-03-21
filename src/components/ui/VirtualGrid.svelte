<script lang="ts" generics="T">
	import { createWindowVirtualizer } from '@tanstack/svelte-virtual';
	import { get } from 'svelte/store';
	import type { Snippet } from 'svelte';

	interface Props {
		items: T[];
		/** Estimated height of one card row in px (excluding gap). */
		itemHeight?: number;
		/** Gap between rows in px. */
		gap?: number;
		item: Snippet<[T, number]>;
	}

	let { items, itemHeight = 360, gap = 24, item: renderItem }: Props = $props();

	let containerEl = $state<HTMLDivElement | undefined>();
	let columns = $state(1);

	// Determine column count from container width via ResizeObserver
	$effect(() => {
		if (!containerEl) return;
		const ro = new ResizeObserver((entries) => {
			const w = entries[0].contentRect.width;
			columns = w >= 1280 ? 4 : w >= 1024 ? 3 : w >= 640 ? 2 : 1;
		});
		ro.observe(containerEl);
		return () => ro.disconnect();
	});

	// Group flat items array into rows of `columns` items each
	const rows = $derived.by(() => {
		const result: T[][] = [];
		for (let i = 0; i < items.length; i += columns) {
			result.push(items.slice(i, i + columns));
		}
		return result;
	});

	const rowHeight = $derived(itemHeight + gap);

	const virtualizer = createWindowVirtualizer({
		count: 0,
		estimateSize: () => rowHeight,
		overscan: 3,
	});

	// Sync reactive row count and estimated size into the virtualizer without
	// creating a reactive loop (use get() to read the store imperatively).
	$effect(() => {
		const count = rows.length;
		const size = rowHeight;
		get(virtualizer).setOptions({
			count,
			estimateSize: () => size,
		});
	});
</script>

<div bind:this={containerEl}>
	<div style="height: {$virtualizer.getTotalSize()}px; position: relative;">
		{#each $virtualizer.getVirtualItems() as vRow (vRow.key)}
			<div
				style="
					position: absolute;
					top: 0;
					left: 0;
					width: 100%;
					transform: translateY({vRow.start}px);
					padding-bottom: {gap}px;
				"
			>
				<div
					style="display: grid; grid-template-columns: repeat({columns}, minmax(0, 1fr)); gap: {gap}px;"
				>
					{#each rows[vRow.index] ?? [] as rowItem, colIdx}
						{@render renderItem(rowItem, vRow.index * columns + colIdx)}
					{/each}
				</div>
			</div>
		{/each}
	</div>
</div>
