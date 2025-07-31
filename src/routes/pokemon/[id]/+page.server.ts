import type { Load } from '@sveltejs/kit';
import type { Pokemon } from '$lib/types';

export const load: Load = async ({ params }) => {
	try {
		const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${params.id}`);
		const pokemon: Pokemon = await response.json();
		return { pokemon };
	} catch (error) {
		console.error('Error fetching Pokemon details:', error);
		return { pokemon: null };
	}
};
