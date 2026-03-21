<script lang="ts">
	import type { BerryFlavor } from '$lib/types';

	let { flavors, compact = false }: { flavors: BerryFlavor[]; compact?: boolean } = $props();

	const FLAVOR_DEFS = [
		{ name: 'spicy',  label: 'Spicy',  color: '#ef4444' },
		{ name: 'dry',    label: 'Dry',    color: '#38bdf8' },
		{ name: 'sweet',  label: 'Sweet',  color: '#f472b6' },
		{ name: 'bitter', label: 'Bitter', color: '#84cc16' },
		{ name: 'sour',   label: 'Sour',   color: '#eab308' }
	] as const;

	function potency(name: string): number {
		return flavors.find((f) => f.flavor.name === name)?.potency ?? 0;
	}

	const allZero = FLAVOR_DEFS.every((f) => potency(f.name) === 0);
</script>

{#if allZero}
	<span
		class="inline-block rounded-full px-2 py-0.5 text-xs font-medium"
		style="background-color: var(--bg-tertiary); color: var(--text-muted);"
	>
		Neutral
	</span>
{:else}
	<div class="space-y-{compact ? '0.5' : '1.5'}">
		{#each FLAVOR_DEFS as { name, label, color }}
			{@const val = potency(name)}
			{#if !compact || val > 0}
				<div class="flex items-center gap-2">
					{#if !compact}
						<span
							class="w-12 shrink-0 text-right text-xs font-medium"
							style="color: var(--text-secondary);"
						>
							{label}
						</span>
					{/if}
					<div
						class="h-2 flex-1 overflow-hidden rounded-full"
						style="background-color: var(--bg-tertiary);"
					>
						<div
							class="h-full rounded-full transition-all duration-500"
							style="width: {(val / 40) * 100}%; background-color: {color};"
						></div>
					</div>
					{#if !compact}
						<span class="w-5 text-right text-xs tabular-nums" style="color: var(--text-muted);">
							{val}
						</span>
					{/if}
				</div>
			{/if}
		{/each}
	</div>
{/if}
