import type { TypeEffectiveness, Pokemon, TeamPokemon } from '$lib/types';

export const TYPE_COLORS: { [key: string]: string } = {
	normal: '#A8A77A', // Stadium/Switch style
	fire: '#EE8130',
	water: '#6390F0',
	electric: '#F7D02C',
	grass: '#7AC74C',
	ice: '#96D9D6',
	fighting: '#C22E28',
	poison: '#A33EA1',
	ground: '#E2BF65',
	flying: '#A98FF3',
	psychic: '#F95587',
	bug: '#A6B91A',
	rock: '#B6A136',
	ghost: '#735797',
	dragon: '#6F35FC',
	dark: '#705746',
	steel: '#B7B7CE',
	fairy: '#D685AD'
};

// Utilitas warna stat untuk tampilan bar stat
export function getStatColor(value: number): string {
	if (value >= 120) return 'bg-green-500';
	if (value >= 90) return 'bg-yellow-500';
	if (value >= 60) return 'bg-orange-500';
	return 'bg-red-500';
}

export const TYPE_EFFECTIVENESS: TypeEffectiveness = {
	normal: {
		weakTo: ['fighting'],
		resistantTo: [],
		immuneTo: ['ghost'],
		superEffectiveAgainst: [],
		notVeryEffectiveAgainst: ['rock', 'steel'],
		noEffectAgainst: ['ghost']
	},
	fire: {
		weakTo: ['water', 'ground', 'rock'],
		resistantTo: ['fire', 'grass', 'ice', 'bug', 'steel', 'fairy'],
		immuneTo: [],
		superEffectiveAgainst: ['grass', 'ice', 'bug', 'steel'],
		notVeryEffectiveAgainst: ['fire', 'water', 'rock', 'dragon'],
		noEffectAgainst: []
	},
	water: {
		weakTo: ['electric', 'grass'],
		resistantTo: ['fire', 'water', 'ice', 'steel'],
		immuneTo: [],
		superEffectiveAgainst: ['fire', 'ground', 'rock'],
		notVeryEffectiveAgainst: ['water', 'grass', 'dragon'],
		noEffectAgainst: []
	},
	electric: {
		weakTo: ['ground'],
		resistantTo: ['electric', 'flying', 'steel'],
		immuneTo: [],
		superEffectiveAgainst: ['water', 'flying'],
		notVeryEffectiveAgainst: ['electric', 'grass', 'dragon'],
		noEffectAgainst: ['ground']
	},
	grass: {
		weakTo: ['fire', 'ice', 'poison', 'flying', 'bug'],
		resistantTo: ['water', 'electric', 'grass', 'ground'],
		immuneTo: [],
		superEffectiveAgainst: ['water', 'ground', 'rock'],
		notVeryEffectiveAgainst: ['fire', 'grass', 'poison', 'flying', 'bug', 'dragon', 'steel'],
		noEffectAgainst: []
	},
	ice: {
		weakTo: ['fire', 'fighting', 'rock', 'steel'],
		resistantTo: ['ice'],
		immuneTo: [],
		superEffectiveAgainst: ['grass', 'ground', 'flying', 'dragon'],
		notVeryEffectiveAgainst: ['fire', 'water', 'ice', 'steel'],
		noEffectAgainst: []
	},
	fighting: {
		weakTo: ['flying', 'psychic', 'fairy'],
		resistantTo: ['bug', 'rock', 'dark'],
		immuneTo: [],
		superEffectiveAgainst: ['normal', 'ice', 'rock', 'dark', 'steel'],
		notVeryEffectiveAgainst: ['poison', 'flying', 'psychic', 'bug', 'fairy'],
		noEffectAgainst: ['ghost']
	},
	poison: {
		weakTo: ['ground', 'psychic'],
		resistantTo: ['grass', 'fighting', 'poison', 'bug', 'fairy'],
		immuneTo: [],
		superEffectiveAgainst: ['grass', 'fairy'],
		notVeryEffectiveAgainst: ['poison', 'ground', 'rock', 'ghost'],
		noEffectAgainst: ['steel']
	},
	ground: {
		weakTo: ['water', 'grass', 'ice'],
		resistantTo: ['poison', 'rock'],
		immuneTo: ['electric'],
		superEffectiveAgainst: ['fire', 'electric', 'poison', 'rock', 'steel'],
		notVeryEffectiveAgainst: ['grass', 'bug'],
		noEffectAgainst: ['flying']
	},
	flying: {
		weakTo: ['electric', 'ice', 'rock'],
		resistantTo: ['grass', 'fighting', 'bug'],
		immuneTo: ['ground'],
		superEffectiveAgainst: ['grass', 'fighting', 'bug'],
		notVeryEffectiveAgainst: ['electric', 'rock', 'steel'],
		noEffectAgainst: []
	},
	psychic: {
		weakTo: ['bug', 'ghost', 'dark'],
		resistantTo: ['fighting', 'psychic'],
		immuneTo: [],
		superEffectiveAgainst: ['fighting', 'poison'],
		notVeryEffectiveAgainst: ['psychic', 'steel'],
		noEffectAgainst: ['dark']
	},
	bug: {
		weakTo: ['fire', 'flying', 'rock'],
		resistantTo: ['grass', 'fighting', 'ground'],
		immuneTo: [],
		superEffectiveAgainst: ['grass', 'psychic', 'dark'],
		notVeryEffectiveAgainst: ['fire', 'fighting', 'poison', 'flying', 'ghost', 'steel', 'fairy'],
		noEffectAgainst: []
	},
	rock: {
		weakTo: ['water', 'grass', 'fighting', 'ground', 'steel'],
		resistantTo: ['normal', 'fire', 'poison', 'flying'],
		immuneTo: [],
		superEffectiveAgainst: ['fire', 'ice', 'flying', 'bug'],
		notVeryEffectiveAgainst: ['fighting', 'ground', 'steel'],
		noEffectAgainst: []
	},
	ghost: {
		weakTo: ['ghost', 'dark'],
		resistantTo: ['poison', 'bug'],
		immuneTo: ['normal', 'fighting'],
		superEffectiveAgainst: ['psychic', 'ghost'],
		notVeryEffectiveAgainst: ['dark'],
		noEffectAgainst: ['normal']
	},
	dragon: {
		weakTo: ['ice', 'dragon', 'fairy'],
		resistantTo: ['fire', 'water', 'electric', 'grass'],
		immuneTo: [],
		superEffectiveAgainst: ['dragon'],
		notVeryEffectiveAgainst: ['steel'],
		noEffectAgainst: ['fairy']
	},
	dark: {
		weakTo: ['fighting', 'bug', 'fairy'],
		resistantTo: ['ghost', 'dark'],
		immuneTo: ['psychic'],
		superEffectiveAgainst: ['psychic', 'ghost'],
		notVeryEffectiveAgainst: ['fighting', 'dark', 'fairy'],
		noEffectAgainst: []
	},
	steel: {
		weakTo: ['fire', 'fighting', 'ground'],
		resistantTo: [
			'normal',
			'grass',
			'ice',
			'flying',
			'psychic',
			'bug',
			'rock',
			'dragon',
			'steel',
			'fairy'
		],
		immuneTo: ['poison'],
		superEffectiveAgainst: ['ice', 'rock', 'fairy'],
		notVeryEffectiveAgainst: ['fire', 'water', 'electric', 'steel'],
		noEffectAgainst: []
	},
	fairy: {
		weakTo: ['poison', 'steel'],
		resistantTo: ['fighting', 'bug', 'dark'],
		immuneTo: ['dragon'],
		superEffectiveAgainst: ['fighting', 'dragon', 'dark'],
		notVeryEffectiveAgainst: ['fire', 'poison', 'steel'],
		noEffectAgainst: []
	}
};

export function getTypeColor(type: string): string {
	return TYPE_COLORS[type] || '#68A090';
}

export function getStatName(statName: string): string {
	const names: Record<string, string> = {
		'hp': 'HP',
		'attack': 'Attack',
		'defense': 'Defense',
		'special-attack': 'Sp. Attack',
		'special-defense': 'Sp. Defense',
		'speed': 'Speed'
	};
	return names[statName] || statName;
}

export function calculateTypeWeaknesses(types: string[]): string[] {
	const weaknesses = new Set<string>();

	types.forEach((type) => {
		TYPE_EFFECTIVENESS[type]?.weakTo.forEach((weakness) => {
			weaknesses.add(weakness);
		});
	});

	// Remove resistances and immunities
	types.forEach((type) => {
		TYPE_EFFECTIVENESS[type]?.resistantTo.forEach((resistance) => {
			weaknesses.delete(resistance);
		});
		TYPE_EFFECTIVENESS[type]?.immuneTo.forEach((immunity) => {
			weaknesses.delete(immunity);
		});
	});

	return Array.from(weaknesses);
}

export function calculateTeamCoverage(team: TeamPokemon[]): {
	weaknesses: { [key: string]: number };
	resistances: { [key: string]: number };
	coverageScore: number;
} {
	const weaknesses: { [key: string]: number } = {};
	const resistances: { [key: string]: number } = {};

	team.forEach((teamPokemon) => {
		const types = teamPokemon.pokemon.types.map((t) => t.type.name);

		// Count weaknesses
		types.forEach((type) => {
			TYPE_EFFECTIVENESS[type]?.weakTo.forEach((weakness) => {
				weaknesses[weakness] = (weaknesses[weakness] || 0) + 1;
			});
		});

		// Count resistances
		types.forEach((type) => {
			TYPE_EFFECTIVENESS[type]?.resistantTo.forEach((resistance) => {
				resistances[resistance] = (resistances[resistance] || 0) + 1;
			});
		});
	});

	// Calculate coverage score (lower is better)
	const totalWeaknesses = Object.values(weaknesses).reduce((sum, count) => sum + count, 0);
	const totalResistances = Object.values(resistances).reduce((sum, count) => sum + count, 0);
	const coverageScore = totalWeaknesses - totalResistances * 0.5;

	return { weaknesses, resistances, coverageScore };
}

export function getStatTotal(pokemon: Pokemon): number {
	return pokemon.stats.reduce((total, stat) => total + stat.base_stat, 0);
}

export function formatStatName(statName: string): string {
	const statNames: { [key: string]: string } = {
		hp: 'HP',
		attack: 'Attack',
		defense: 'Defense',
		'special-attack': 'Sp. Attack',
		'special-defense': 'Sp. Defense',
		speed: 'Speed'
	};
	return statNames[statName] || statName;
}

export function getGenerationFromId(id: number): number {
	if (id <= 151) return 1;
	if (id <= 251) return 2;
	if (id <= 386) return 3;
	if (id <= 493) return 4;
	if (id <= 649) return 5;
	if (id <= 721) return 6;
	if (id <= 809) return 7;
	if (id <= 905) return 8;
	return 9;
}

export const POKEMON_TYPES = [
	'normal',
	'fire',
	'water',
	'electric',
	'grass',
	'ice',
	'fighting',
	'poison',
	'ground',
	'flying',
	'psychic',
	'bug',
	'rock',
	'ghost',
	'dragon',
	'dark',
	'steel',
	'fairy'
];

export const GENERATIONS = [
	{ id: 1, name: 'Kanto', range: '1-151' },
	{ id: 2, name: 'Johto', range: '152-251' },
	{ id: 3, name: 'Hoenn', range: '252-386' },
	{ id: 4, name: 'Sinnoh', range: '387-493' },
	{ id: 5, name: 'Unova', range: '494-649' },
	{ id: 6, name: 'Kalos', range: '650-721' },
	{ id: 7, name: 'Alola', range: '722-809' },
	{ id: 8, name: 'Galar', range: '810-905' },
	{ id: 9, name: 'Paldea', range: '906+' }
];
