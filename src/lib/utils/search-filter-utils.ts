import type { SearchFilters } from '$lib/types';

export interface StatRange {
	min: number;
	max: number;
}

export interface StatRanges {
	[key: string]: StatRange;
}

export class SearchFilterUtils {
	/**
	 * Default stat ranges for Pokemon
	 */
	static readonly STAT_RANGES: StatRanges = {
		hp: { min: 1, max: 255 },
		attack: { min: 1, max: 190 },
		defense: { min: 1, max: 230 },
		specialAttack: { min: 1, max: 194 },
		specialDefense: { min: 1, max: 230 },
		speed: { min: 1, max: 180 }
	};

	/**
	 * Format stat name for display
	 */
	static formatStatName(statName: string): string {
		const names: { [key: string]: string } = {
			hp: 'HP',
			attack: 'Attack',
			defense: 'Defense',
			specialAttack: 'Sp. Attack',
			specialDefense: 'Sp. Defense',
			speed: 'Speed'
		};
		return names[statName] || statName;
	}

	/**
	 * Create empty search filters
	 */
	static createEmptyFilters(): SearchFilters {
		return {
			types: [],
			generations: [],
			minStats: {},
			maxStats: {}
		};
	}

	/**
	 * Check if filters are empty
	 */
	static areFiltersEmpty(filters: SearchFilters): boolean {
		return (
			filters.types.length === 0 &&
			filters.generations.length === 0 &&
			Object.keys(filters.minStats || {}).length === 0 &&
			Object.keys(filters.maxStats || {}).length === 0
		);
	}

	/**
	 * Toggle type in filters
	 */
	static toggleType(filters: SearchFilters, type: string): SearchFilters {
		const newFilters = { ...filters };
		if (newFilters.types.includes(type)) {
			newFilters.types = newFilters.types.filter(t => t !== type);
		} else {
			newFilters.types = [...newFilters.types, type];
		}
		return newFilters;
	}

	/**
	 * Toggle generation in filters
	 */
	static toggleGeneration(filters: SearchFilters, generation: number): SearchFilters {
		const genString = generation.toString();
		const newFilters = { ...filters };
		
		if (newFilters.generations.includes(genString)) {
			newFilters.generations = newFilters.generations.filter(g => g !== genString);
		} else {
			newFilters.generations = [...newFilters.generations, genString];
		}
		return newFilters;
	}

	/**
	 * Update stat filter
	 */
	static updateStatFilter(
		filters: SearchFilters,
		statName: string,
		type: 'min' | 'max',
		value: number
	): SearchFilters {
		const newFilters = { ...filters };
		
		if (type === 'min') {
			if (!newFilters.minStats) newFilters.minStats = {};
			newFilters.minStats[statName] = value;
		} else {
			if (!newFilters.maxStats) newFilters.maxStats = {};
			newFilters.maxStats[statName] = value;
		}
		
		return newFilters;
	}

	/**
	 * Get stat value for filter display
	 */
	static getStatValue(filters: SearchFilters, statName: string, type: 'min' | 'max'): number {
		const statRanges = this.STAT_RANGES[statName];
		if (!statRanges) return 0;

		if (type === 'min') {
			return filters.minStats?.[statName] || statRanges.min;
		} else {
			return filters.maxStats?.[statName] || statRanges.max;
		}
	}

	/**
	 * Validate filters
	 */
	static validateFilters(filters: SearchFilters): boolean {
		// Check if min stats are not greater than max stats
		if (filters.minStats && filters.maxStats) {
			for (const statName in filters.minStats) {
				const minValue = filters.minStats[statName];
				const maxValue = filters.maxStats[statName];
				if (maxValue && minValue > maxValue) {
					return false;
				}
			}
		}
		return true;
	}
}