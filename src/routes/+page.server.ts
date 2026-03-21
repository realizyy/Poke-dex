import type { Load } from '@sveltejs/kit';
import { PokemonService } from '$lib/services/pokemon-service';

export const load: Load = async () => {
	try {
		// 8 iconic Pokémon spanning diverse types & generations for the home spotlight
		const featuredIds = [6, 25, 94, 133, 150, 197, 384, 448];
		const pokemonDetails = await PokemonService.fetchPokemonBatch(featuredIds);

		// Warm up a broader cache in the background so detail pages feel instant
		PokemonService.preloadFeaturedPokemon();

		return { pokemons: pokemonDetails };
	} catch (error) {
		console.error('Error loading featured Pokemon:', error);
		return { pokemons: [] };
	}
};