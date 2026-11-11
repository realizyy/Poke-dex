<script lang="ts">
	import { cacheState, pokemonCacheManager } from '#lib/stores/pokemon-cache';
	import { onMount } from 'svelte';

	let showDetails = $state(false);

	onMount(() => {
		// Refresh cache stats periodically
		const interval = setInterval(() => {
			pokemonCacheManager.updateCacheStats();
		}, 1000);

		return () => clearInterval(interval);
	});
</script>

<div class="fixed right-4 bottom-4 z-50">
	<div
		class="theme-bg-secondary theme-border min-w-48 rounded-lg text-xs shadow-lg"
		style="background-color: var(--bg-secondary); border-color: var(--border-color);"
	>
		<button
			class="hover:theme-bg-tertiary border-theme-border w-full rounded-t-lg rounded-b-lg border-1 p-2 text-left transition-colors"
			style="color: var(--text-main);"
			onclick={() => (showDetails = !showDetails)}
		>
			<div class="flex items-center justify-between">
				<span class="theme-text font-semibold">Cache</span>
				<span class="theme-text-secondary">{$cacheState.cacheStats.size} items</span>
			</div>
		</button>

		{#if showDetails}
			<div
				class="border-theme-border space-y-1 rounded-t-sm rounded-b-lg border-1 p-2"
				style="border-color: var(--border-color);"
			>
				<div class="theme-text-secondary flex justify-between">
					<span>Size:</span>
					<span class="text-blue-600 dark:text-blue-400">{$cacheState.cacheStats.size} items</span>
				</div>
				<div class="theme-text-secondary flex justify-between">
					<span>Capacity:</span>
					<span class="text-purple-600 dark:text-purple-400">{$cacheState.cacheStats.capacity}</span
					>
				</div>
				<div class="theme-text-secondary flex justify-between">
					<span>Hit Rate:</span>
					<span class="text-green-600 dark:text-green-400">{$cacheState.cacheStats.hitRate}%</span>
				</div>

				<div
					class="theme-border space-y-1 border-t pt-2"
					style="border-color: var(--border-color);"
				>
					<button
						class="w-full rounded bg-yellow-500 px-2 py-1 text-xs text-white transition-colors hover:bg-yellow-600"
						onclick={() => pokemonCacheManager.clearExpiredCache()}
					>
						Clear Expired
					</button>
					<button
						class="w-full rounded bg-red-500 px-2 py-1 text-xs text-white transition-colors hover:bg-red-600"
						onclick={() => pokemonCacheManager.clearCache()}
					>
						Clear All
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
