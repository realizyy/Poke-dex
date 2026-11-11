import { writable } from 'svelte/store';
import { PokemonService } from '#lib/services/pokemon-service';
import { browser } from '$app/env';

interface CacheState {
	cacheStats: {
		size: number;
		hitRate: number;
		capacity: string;
	};
}

export const cacheState = writable<CacheState>({
	cacheStats: { size: 0, hitRate: 0, capacity: '0 / 0' }
});

class PokemonCacheManager {
	updateCacheStats(): void {
		cacheState.set({ cacheStats: PokemonService.getCacheStats() });
	}

	clearCache(): void {
		PokemonService.clearAllCache();
		this.updateCacheStats();
	}

	clearExpiredCache(): void {
		PokemonService.clearExpiredCache();
		this.updateCacheStats();
	}
}

export const pokemonCacheManager = new PokemonCacheManager();

if (browser) {
	setInterval(() => pokemonCacheManager.clearExpiredCache(), 3 * 60 * 1000);
}
