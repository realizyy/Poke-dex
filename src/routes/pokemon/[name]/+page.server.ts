import type { Load } from '@sveltejs/kit';
import type { Pokemon } from '$lib/types';

export const load: Load = async ({ params }) => {
	try {
		// Convert name to lowercase as PokeAPI expects lowercase names
		const pokemonName = params.name?.toLowerCase();
		const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);
		
		if (!response.ok) {
			throw new Error(`Pokemon ${pokemonName} not found`);
		}
		
		const pokemon: Pokemon = await response.json();
		return { pokemon };
	} catch (error) {
		console.error('Error fetching Pokemon details:', error);
		return { pokemon: null };
	}
};
