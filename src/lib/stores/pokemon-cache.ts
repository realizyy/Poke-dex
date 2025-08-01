import { writable } from 'svelte/store';
import { PokemonService } from '$lib/services/pokemon-service';
import { browser } from '$app/environment';

interface CacheState {
	isPreloading: boolean;
	preloadProgress: number;
	cacheStats: {
		size: number;
		hitRate: number;
		memoryUsage: string;
	};
}

const initialState: CacheState = {
	isPreloading: false,
	preloadProgress: 0,
	cacheStats: {
		size: 0,
		hitRate: 0,
		memoryUsage: '0 KB'
	}
};

export const cacheState = writable<CacheState>(initialState);

class PokemonCacheManager {
	private static instance: PokemonCacheManager;
	
	static getInstance(): PokemonCacheManager {
		if (!PokemonCacheManager.instance) {
			PokemonCacheManager.instance = new PokemonCacheManager();
		}
		return PokemonCacheManager.instance;
	}

	async initializeCache(): Promise<void> {
		if (!browser) return;
		
		cacheState.update(state => ({ ...state, isPreloading: true }));
		
		try {
			// Only preload featured Pokemon, not initial batch
			await this.preloadFeaturedPokemon();
		} finally {
			cacheState.update(state => ({ 
				...state, 
				isPreloading: false,
				cacheStats: PokemonService.getCacheStats()
			}));
		}
	}

	private async preloadFeaturedPokemon(): Promise<void> {
		await PokemonService.preloadFeaturedPokemon();
		cacheState.update(state => ({ ...state, preloadProgress: 100 }));
	}

	updateCacheStats(): void {
		const stats = PokemonService.getCacheStats();
		cacheState.update(state => ({ ...state, cacheStats: stats }));
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

export const pokemonCacheManager = PokemonCacheManager.getInstance();

// Auto-initialize cache when store is imported (only featured Pokemon)
if (browser) {
	pokemonCacheManager.initializeCache();
	
	// Periodic cache cleanup
	setInterval(() => {
		pokemonCacheManager.clearExpiredCache();
	}, 3 * 60 * 1000); // Every 3 minutes
}
