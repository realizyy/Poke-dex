import type { Pokemon, TeamPokemon } from '$lib/types';

const STAT_NAMES = ['hp', 'attack', 'defense', 'special-attack', 'special-defense', 'speed'];

interface PokemonOptions {
	id?: number;
	name?: string;
	types?: string[];
	stats?: Partial<Record<string, number>>;
}

export function makePokemon({
	id = 25,
	name = 'pikachu',
	types = ['electric'],
	stats = {}
}: PokemonOptions = {}): Pokemon {
	return {
		id,
		name,
		types: types.map((type) => ({ type: { name: type } })),
		sprites: {
			front_default: null,
			back_default: null,
			front_shiny: null,
			back_shiny: null,
			front_female: null,
			back_female: null,
			front_shiny_female: null,
			other: {
				'official-artwork': { front_default: `https://img.test/${id}.png`, front_shiny: null },
				dream_world: { front_default: null, front_female: null },
				home: {
					front_default: null,
					front_shiny: null,
					front_female: null,
					front_shiny_female: null
				}
			}
		},
		stats: STAT_NAMES.map((stat) => ({ base_stat: stats[stat] ?? 50, stat: { name: stat } })),
		abilities: [],
		moves: [],
		species: { url: `https://pokeapi.co/api/v2/pokemon-species/${id}/` },
		base_experience: 100,
		height: 4,
		weight: 60
	};
}

export function makeTeamPokemon(options: PokemonOptions & { moves?: string[] } = {}): TeamPokemon {
	const { moves = [], ...pokemonOptions } = options;
	return { pokemon: makePokemon(pokemonOptions), moves };
}
