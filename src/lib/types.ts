export interface Pokemon {
	id: number;
	name: string;
	types: { type: { name: string } }[];
	sprites: { other: { 'official-artwork': { front_default: string } } };
	stats: { base_stat: number; stat: { name: string } }[];
	abilities: { ability: { name: string } }[];
	moves: { move: { name: string } }[];
	species: { url: string };
	base_experience: number;
	height: number;
	weight: number;
}

export interface PokemonSpecies {
	generation: { name: string };
	color: { name: string };
	habitat: { name: string } | null;
	capture_rate: number;
	evolution_chain?: { url: string };
}

export interface TeamPokemon {
	pokemon: Pokemon;
	moves: string[];
	nickname?: string;
}

export interface Team {
	id: string;
	name: string;
	pokemons: TeamPokemon[];
	createdAt: Date;
}

export interface TypeEffectiveness {
	[key: string]: {
		weakTo: string[];
		resistantTo: string[];
		immuneTo: string[];
		superEffectiveAgainst: string[];
		notVeryEffectiveAgainst: string[];
		noEffectAgainst: string[];
	};
}

export interface SearchFilters {
	types: string[];
	generations: string[];
	minStats?: {
		[key: string]: number;
	};
	maxStats?: {
		[key: string]: number;
	};
}

export interface ColorType {
	[key: string]: string;
}
