<script lang="ts">
	import { cacheState, pokemonCacheManager } from '$lib/stores/pokemon-cache';
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

<div class="fixed bottom-4 right-4 z-50">
	<div class="theme-bg-secondary theme-border rounded-lg shadow-lg text-xs min-w-48" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
		<button
			class="w-full p-2 text-left hover:theme-bg-tertiary transition-colors rounded-t-lg border-1 rounded-b-lg border-theme-border"
			style="color: var(--text-main);"
			onclick={() => showDetails = !showDetails}
		>
			<div class="flex justify-between items-center">
				<span class="font-semibold theme-text">Cache</span>
				<span class="theme-text-secondary">{$cacheState.cacheStats.size} items</span>
			</div>
		</button>
		
		{#if showDetails}
			<div class="p-2 rounded-t-sm border-1 rounded-b-lg border-theme-border space-y-1" style="border-color: var(--border-color);">
				<div class="flex justify-between theme-text-secondary">
					<span>Size:</span>
					<span class="text-blue-600 dark:text-blue-400">{$cacheState.cacheStats.size} items</span>
				</div>
				<div class="flex justify-between theme-text-secondary">
					<span>Memory:</span>
					<span class="text-purple-600 dark:text-purple-400">{$cacheState.cacheStats.memoryUsage}</span>
				</div>
				<div class="flex justify-between theme-text-secondary">
					<span>Hit Rate:</span>
					<span class="text-green-600 dark:text-green-400">{$cacheState.cacheStats.hitRate}%</span>
				</div>
				
				<div class="pt-2 space-y-1 border-t theme-border" style="border-color: var(--border-color);">
					<button
						class="w-full bg-yellow-500 hover:bg-yellow-600 text-white text-xs py-1 px-2 rounded transition-colors"
						onclick={() => pokemonCacheManager.clearExpiredCache()}
					>
						Clear Expired
					</button>
					<button
						class="w-full bg-red-500 hover:bg-red-600 text-white text-xs py-1 px-2 rounded transition-colors"
						onclick={() => pokemonCacheManager.clearCache()}
					>
						Clear All
					</button>
				</div>
			</div>
		{/if}
	</div>
</div>
