<script lang="ts">
	import type { Berry } from '$lib/types';
	import { getTypeColor } from '$lib/utils/pokemon-utils';

	let { berry, onclick }: { berry: Berry; onclick?: () => void } = $props();

	const spriteUrl = $derived(
		`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/${berry.name}-berry.png`
	);
	const displayName = $derived(
		berry.name
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ')
	);
	const typeColor = $derived(getTypeColor(berry.natural_gift_type.name));

	const FLAVOR_COLORS: Record<string, string> = {
		spicy:  '#ef4444',
		dry:    '#38bdf8',
		sweet:  '#f472b6',
		bitter: '#84cc16',
		sour:   '#eab308'
	};
	const FLAVOR_NAMES = ['spicy', 'dry', 'sweet', 'bitter', 'sour'] as const;

	function potency(name: string): number {
		return berry.flavors.find((f) => f.flavor.name === name)?.potency ?? 0;
	}
</script>

<button
	{onclick}
	class="group relative flex w-full flex-col overflow-hidden rounded-2xl text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
	style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
>
	<!-- Type color accent strip -->
	<div class="h-0.5 w-full shrink-0" style="background-color: {typeColor};"></div>

	<div class="flex flex-col items-center gap-2.5 px-4 py-3">
		<!-- Sprite with soft glow -->
		<div class="relative flex h-14 w-14 items-center justify-center">
			<div
				class="absolute inset-0 rounded-full blur-md opacity-25 transition-opacity duration-300 group-hover:opacity-40"
				style="background-color: {typeColor};"
			></div>
			<img
				src={spriteUrl}
				alt="{displayName} Berry"
				class="relative z-10 h-12 w-12 object-contain drop-shadow"
				width="48" height="48"
				onerror={(e) => ((e.currentTarget as HTMLImageElement).style.display = 'none')}
			/>
		</div>

		<!-- Name -->
		<p class="text-center text-sm font-bold leading-snug theme-text">
			{displayName} Berry
		</p>

		<!-- Type badge + power -->
		<div class="flex flex-wrap items-center justify-center gap-1.5">
			<span
				class="rounded-full px-2.5 py-0.5 text-xs font-semibold capitalize text-white"
				style="background-color: {typeColor};"
			>
				{berry.natural_gift_type.name}
			</span>
			<span
				class="rounded-full px-2 py-0.5 text-xs font-medium tabular-nums"
				style="background-color: var(--bg-tertiary); color: var(--text-secondary);"
			>
				{berry.natural_gift_power} PWR
			</span>
		</div>

		<!-- Flavor dots — proportional size circles -->
		<div class="flex items-end justify-center gap-1.5 py-0.5" title="Flavor profile">
			{#each FLAVOR_NAMES as flavorName}
				{@const pot = potency(flavorName)}
				{@const size = pot > 0 ? Math.max(7, Math.round((pot / 40) * 16)) : 5}
				<div
					class="rounded-full transition-all duration-300"
					style="
						width: {size}px;
						height: {size}px;
						background-color: {pot > 0 ? FLAVOR_COLORS[flavorName] : 'var(--border-color)'};
						opacity: {pot > 0 ? 1 : 0.35};
					"
					title="{flavorName}: {pot}"
				></div>
			{/each}
		</div>
	</div>

	<!-- Stats footer -->
	<div
		class="flex items-center justify-around border-t px-3 py-2 text-xs"
		style="border-color: var(--border-color); color: var(--text-muted);"
	>
		<span title="Growth time">⏱ {berry.growth_time}h</span>
		<span class="opacity-20">|</span>
		<span title="Max harvest">×{berry.max_harvest}</span>
		<span class="opacity-20">|</span>
		<span title="Smoothness">{berry.smoothness} smo.</span>
	</div>
</button>
