<script lang="ts">
	import type { PageData } from './$types';
	import { Leaf } from '$lib/icons';

	let { data }: { data: PageData } = $props();

	let searchQuery = $state('');

	const filtered = $derived(
		searchQuery.trim()
			? data.natures.filter((n) =>
					n.name.toLowerCase().includes(searchQuery.toLowerCase())
				)
			: data.natures
	);

	function formatStat(name: string | null): string {
		if (!name) return '—';
		return name
			.replace(/-/g, ' ')
			.replace(/\b\w/g, (c) => c.toUpperCase());
	}

	function formatFlavor(name: string | null): string {
		if (!name) return '—';
		return name.charAt(0).toUpperCase() + name.slice(1);
	}
</script>

<svelte:head>
	<title>Nature Chart – Pokédex</title>
	<meta
		name="description"
		content="All 25 Pokémon natures with increased/decreased stats and flavor preferences."
	/>
</svelte:head>

<!-- Hero -->
<div
	class="relative overflow-hidden px-6 py-14 text-white"
	style="background-color: #d97706;"
>
	<!-- Decorative rings — clipped to right/bottom-left corners to prevent arc bleed -->
	<div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
		<div
			class="absolute -right-16 -top-16 h-64 w-64 rounded-full"
			style="border: 30px solid rgba(255,255,255,0.10);"
		></div>
	</div>
	<div class="pointer-events-none absolute bottom-0 left-0 h-1/2 w-1/2 overflow-hidden">
		<div
			class="absolute -bottom-8 -left-8 h-40 w-40 rounded-full"
			style="border: 18px solid rgba(255,255,255,0.05);"
		></div>
	</div>

	<div class="relative mx-auto max-w-5xl">
		<div class="mb-3 flex items-center gap-2">
			<Leaf size={18} />
			<span class="text-sm font-medium uppercase tracking-widest opacity-80">Nature Chart</span>
		</div>
		<h1 class="text-4xl font-extrabold tracking-tight drop-shadow">Natures</h1>
		<p class="mt-2 max-w-xl text-sm opacity-80">
			Each nature boosts one stat by 10% and lowers another by 10%. Five natures are neutral and have
			no stat effect.
		</p>
	</div>
</div>

<!-- Search -->
<div class="mx-auto max-w-5xl px-4 py-6">
	<div class="relative mb-6 max-w-sm">
		<svg
			class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-40"
			width="16"
			height="16"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
		>
			<circle cx="11" cy="11" r="8" />
			<path d="m21 21-4.35-4.35" />
		</svg>
		<input
			type="text"
			bind:value={searchQuery}
			placeholder="Search natures…"
			class="w-full rounded-lg border py-2 pl-9 pr-4 text-sm outline-none focus:ring-2 focus:ring-amber-500"
			style="background: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
		/>
	</div>

	<!-- Desktop Table -->
	<div class="hidden overflow-hidden rounded-xl border md:block" style="border-color: var(--border-color);">
		<table class="w-full text-sm">
			<thead>
				<tr style="background: var(--bg-secondary); border-bottom: 1px solid var(--border-color);">
					<th class="px-4 py-3 text-left font-semibold" style="color: var(--text-main);">Nature</th>
					<th class="px-4 py-3 text-left font-semibold text-green-500">↑ Increased Stat</th>
					<th class="px-4 py-3 text-left font-semibold text-red-500">↓ Decreased Stat</th>
					<th class="px-4 py-3 text-left font-semibold" style="color: var(--text-muted);">Likes Flavor</th>
					<th class="px-4 py-3 text-left font-semibold" style="color: var(--text-muted);">Hates Flavor</th>
				</tr>
			</thead>
			<tbody>
				{#each filtered as nature, i}
					<tr
						class="transition-colors"
						style="background: {i % 2 === 0
							? 'var(--bg-secondary)'
							: 'var(--bg-tertiary)'}; border-bottom: 1px solid var(--border-color);"
					>
						<td class="px-4 py-3 font-medium capitalize" style="color: var(--text-main);">
							{nature.name}
						</td>
						<td class="px-4 py-3">
							{#if nature.increased_stat}
								<span class="font-medium text-green-500">
									{formatStat(nature.increased_stat.name)}
								</span>
							{:else}
								<span style="color: var(--text-muted);">—</span>
							{/if}
						</td>
						<td class="px-4 py-3">
							{#if nature.decreased_stat}
								<span class="font-medium text-red-500">
									{formatStat(nature.decreased_stat.name)}
								</span>
							{:else}
								<span style="color: var(--text-muted);">—</span>
							{/if}
						</td>
						<td class="px-4 py-3 capitalize" style="color: var(--text-secondary);">
							{formatFlavor(nature.likes_flavor?.name ?? null)}
						</td>
						<td class="px-4 py-3 capitalize" style="color: var(--text-secondary);">
							{formatFlavor(nature.hates_flavor?.name ?? null)}
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
		{#if filtered.length === 0}
			<p class="py-10 text-center text-sm" style="color: var(--text-muted);">
				No natures found matching "{searchQuery}".
			</p>
		{/if}
	</div>

	<!-- Mobile Card Grid -->
	<div class="grid gap-3 md:hidden">
		{#each filtered as nature}
			<div
				class="rounded-xl border p-4"
				style="background: var(--bg-secondary); border-color: var(--border-color);"
			>
				<p class="mb-3 text-base font-bold capitalize" style="color: var(--text-main);">
					{nature.name}
				</p>
				<div class="grid grid-cols-2 gap-2 text-sm">
					<div>
						<p class="mb-0.5 text-xs font-medium text-green-500">↑ Increased</p>
						{#if nature.increased_stat}
							<p class="font-medium text-green-500">{formatStat(nature.increased_stat.name)}</p>
						{:else}
							<p style="color: var(--text-muted);">—</p>
						{/if}
					</div>
					<div>
						<p class="mb-0.5 text-xs font-medium text-red-500">↓ Decreased</p>
						{#if nature.decreased_stat}
							<p class="font-medium text-red-500">{formatStat(nature.decreased_stat.name)}</p>
						{:else}
							<p style="color: var(--text-muted);">—</p>
						{/if}
					</div>
					<div>
						<p class="mb-0.5 text-xs" style="color: var(--text-muted);">Likes</p>
						<p class="capitalize" style="color: var(--text-secondary);">
							{formatFlavor(nature.likes_flavor?.name ?? null)}
						</p>
					</div>
					<div>
						<p class="mb-0.5 text-xs" style="color: var(--text-muted);">Hates</p>
						<p class="capitalize" style="color: var(--text-secondary);">
							{formatFlavor(nature.hates_flavor?.name ?? null)}
						</p>
					</div>
				</div>
			</div>
		{/each}
		{#if filtered.length === 0}
			<p class="mt-4 text-center text-sm" style="color: var(--text-muted);">
				No natures found matching "{searchQuery}".
			</p>
		{/if}
	</div>

	<p class="mt-6 text-center text-xs" style="color: var(--text-muted);">
		{filtered.length} of {data.natures.length} natures shown
	</p>
</div>
