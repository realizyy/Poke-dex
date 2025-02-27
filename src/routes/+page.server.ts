import type { Load } from '@sveltejs/kit';
import type { Pokemon } from '$lib/types';

export const load: Load = async () => {
	const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=10');
	const data = await response.json();

	const pokemonDetails = await Promise.all(
		data.results.map(async (pokemon: { url: string }) => {
			const res = await fetch(pokemon.url);
			return res.json() as Promise<Pokemon>;
		})
	);

	return {
		pokemons: pokemonDetails
	};
};