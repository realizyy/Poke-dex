<script lang="ts">
	import type { Item } from '$lib/types';
	import { Package } from '$lib/icons';

	let { item, onclick }: { item: Item; onclick?: () => void } = $props();

	const displayName = $derived(
		item.name
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ')
	);

	const categoryDisplay = $derived(
		item.category.name
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ')
	);

	const POCKET_COLORS: Record<string, string> = {
		pokeballs:    '#ef4444',
		medicine:     '#22c55e',
		berries:      '#84cc16',
		'hold-items': '#8b5cf6',
		machines:     '#f59e0b',
		'key-items':  '#3b82f6',
		collectibles: '#ec4899',
		evolution:    '#14b8a6',
		training:     '#f97316',
		spelunking:   '#78716c'
	};

	function getCategoryColor(catName: string): string {
		for (const [pocket, color] of Object.entries(POCKET_COLORS)) {
			if (catName.includes(pocket.replace('-items', '').replace('-', ''))) return color;
		}
		return '#6b7280';
	}

	const catColor = $derived(getCategoryColor(item.category.name));

	const costLabel = $derived(
		item.cost === 0
			? 'Free'
			: item.cost >= 10000
				? `₽${(item.cost / 1000).toFixed(0)}k`
				: `₽${item.cost.toLocaleString()}`
	);
</script>

<button
	{onclick}
	class="group relative flex w-full flex-col overflow-hidden rounded-xl text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
	style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
>
	<!-- Left category color strip -->
	<div
		class="absolute inset-y-0 left-0 w-[3px] rounded-l-xl"
		style="background-color: {catColor};"
	></div>

	<div class="flex items-start gap-3 p-3 pl-4">
		<!-- Sprite -->
		<div
			class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
			style="background-color: {catColor}1A;"
		>
			{#if item.sprites.default}
				<img
					src={item.sprites.default}
					alt=""
					class="h-8 w-8 object-contain"
					width="32" height="32"
				/>
			{:else}
				<Package size={18} style="color: {catColor};" />
			{/if}
		</div>

		<!-- Info -->
		<div class="min-w-0 flex-1">
			<p class="mb-1.5 line-clamp-2 text-sm font-semibold leading-snug theme-text">{
				displayName
			}</p>
			<div class="flex items-center gap-2 flex-wrap">
				<span
					class="rounded-full px-2 py-0.5 text-xs font-medium capitalize"
					style="background-color: {catColor}1A; color: {catColor};"
				>{categoryDisplay}</span>
				<span class="text-xs tabular-nums" style="color: var(--text-muted);">{costLabel}</span>
			</div>
		</div>
	</div>

</button>
