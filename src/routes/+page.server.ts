import type { Load } from '@sveltejs/kit';
import type { Pokemon } from '$lib/types';
import { PokemonService } from '$lib/services/pokemon-service';

export const load: Load = async () => {
	try {
		// Start preloading featured Pokemon in background
		PokemonService.preloadFeaturedPokemon();
		
		// Get featured Pokemon for homepage (first 20 from featured list)
		const featuredIds = [1, 4, 7, 25, 39, 52, 54, 74, 104, 113, 133, 143, 150, 151, 251, 384, 493, 144, 145, 146];
		const pokemonDetails = await PokemonService.fetchPokemonBatch(featuredIds.slice(0, 20));

		return {
			pokemons: pokemonDetails
		};
	} catch (error) {
		console.error('Error loading featured Pokemon:', error);
		
		// Fallback to original API call
		const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=20');
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
	}
};