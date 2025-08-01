import { goto } from '$app/navigation';
import { browser } from '$app/environment';
import type { SearchFilters } from '$lib/types';

export class URLUtils {
	/**
	 * Update search URL with current parameters
	 */
	static updateSearchUrl(query: string, filters: SearchFilters, offset: number = 0): void {
		if (!browser) return;
		
		const params = new URLSearchParams();
		
		if (query.trim()) {
			params.set('q', query);
		}
		
		if (filters.types && filters.types.length > 0) {
			params.set('types', filters.types.join(','));
		}
		
		if (filters.generations && filters.generations.length > 0) {
			params.set('generations', filters.generations.join(','));
		}
		
		if (offset > 0) {
			params.set('offset', offset.toString());
		}
		
		const url = `/search${params.toString() ? '?' + params.toString() : ''}`;
		goto(url, { replaceState: true });
	}

	/**
	 * Parse search filters from URL parameters
	 */
	static parseSearchFiltersFromUrl(searchParams: URLSearchParams): SearchFilters {
		return {
			types: searchParams.get('types')?.split(',').filter(Boolean) || [],
			generations: searchParams.get('generations')?.split(',').filter(Boolean) || [],
			minStats: {},
			maxStats: {}
		};
	}

	/**
	 * Parse search query from URL parameters
	 */
	static parseSearchQueryFromUrl(searchParams: URLSearchParams): string {
		return searchParams.get('q') || '';
	}

	/**
	 * Parse offset from URL parameters
	 */
	static parseOffsetFromUrl(searchParams: URLSearchParams): number {
		return parseInt(searchParams.get('offset') || '0');
	}

	/**
	 * Clear all URL parameters
	 */
	static clearSearchUrl(): void {
		if (!browser) return;
		goto('/search', { replaceState: true });
	}

	/**
	 * Navigate to Pokemon detail page
	 */
	static navigateToPokemon(pokemonName: string): void {
		goto(`/pokemon/${pokemonName}`);
	}

	/**
	 * Navigate to teams page
	 */
	static navigateToTeams(): void {
		goto('/teams');
	}

	/**
	 * Navigate to battle page
	 */
	static navigateToBattle(): void {
		goto('/battle');
	}
}