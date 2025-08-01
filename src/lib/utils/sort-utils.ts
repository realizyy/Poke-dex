import type { Pokemon } from '$lib/types';

export type SortBy = 'id' | 'name' | 'stats';
export type SortOrder = 'asc' | 'desc';

export class SortUtils {
	/**
	 * Sort Pokemon array based on criteria
	 */
	static sortPokemon(pokemons: Pokemon[], sortBy: SortBy, sortOrder: SortOrder): Pokemon[] {
		if (!pokemons || pokemons.length === 0) return [];

		return [...pokemons].sort((a, b) => {
			let comparison = 0;
			
			switch (sortBy) {
				case 'id':
					comparison = a.id - b.id;
					break;
				case 'name':
					comparison = a.name.localeCompare(b.name);
					break;
				case 'stats':
					const aTotal = this.calculateTotalStats(a);
					const bTotal = this.calculateTotalStats(b);
					comparison = aTotal - bTotal;
					break;
				default:
					comparison = a.id - b.id;
			}
			
			return sortOrder === 'desc' ? -comparison : comparison;
		});
	}

	/**
	 * Calculate total base stats for a Pokemon
	 */
	static calculateTotalStats(pokemon: Pokemon): number {
		return pokemon.stats.reduce((sum, stat) => sum + stat.base_stat, 0);
	}

	/**
	 * Get sort option display name
	 */
	static getSortDisplayName(sortBy: SortBy): string {
		const names: Record<SortBy, string> = {
			id: '#',
			name: 'Name',
			stats: 'Stats'
		};
		return names[sortBy] || names.id;
	}

	/**
	 * Get next sort order
	 */
	static getNextSortOrder(currentOrder: SortOrder): SortOrder {
		return currentOrder === 'asc' ? 'desc' : 'asc';
	}

	/**
	 * Get sort order icon class
	 */
	static getSortOrderIconClass(sortOrder: SortOrder): string {
		return sortOrder === 'desc' ? 'rotate-180' : '';
	}
}