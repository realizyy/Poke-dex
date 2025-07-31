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
	<div class="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg text-xs min-w-48">
		<button
			class="w-full p-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors rounded-t-lg"
			onclick={() => showDetails = !showDetails}
		>
			<div class="flex justify-between items-center">
				<span class="font-semibold text-gray-900 dark:text-white">Cache</span>
				<span class="text-gray-600 dark:text-gray-300">{$cacheState.cacheStats.size} items</span>
			</div>
		</button>
		
		{#if showDetails}
			<div class="p-2 border-t border-gray-200 dark:border-gray-600 space-y-1">
				<div class="flex justify-between text-gray-700 dark:text-gray-300">
					<span>Size:</span>
					<span class="text-blue-600 dark:text-blue-400">{$cacheState.cacheStats.size} items</span>
				</div>
				<div class="flex justify-between text-gray-700 dark:text-gray-300">
					<span>Memory:</span>
					<span class="text-purple-600 dark:text-purple-400">{$cacheState.cacheStats.memoryUsage}</span>
				</div>
				<div class="flex justify-between text-gray-700 dark:text-gray-300">
					<span>Hit Rate:</span>
					<span class="text-green-600 dark:text-green-400">{$cacheState.cacheStats.hitRate}%</span>
				</div>
				
				<div class="pt-2 space-y-1 border-t border-gray-200 dark:border-gray-600">
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
