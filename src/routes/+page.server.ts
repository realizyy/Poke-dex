import type { Load } from '@sveltejs/kit';
import { PokemonService } from '$lib/services/pokemon-service';
import { TcgService } from '$lib/services/tcg-service';

// ~60 iconic Pokémon across all 9 generations — 8 are picked at random each load
const SPOTLIGHT_POOL = [
	// Gen 1
	3, 6, 9, 25, 38, 52, 65, 94, 130, 131, 133, 143, 149, 150, 151,
	// Gen 2
	157, 196, 197, 212, 248, 249, 250, 251,
	// Gen 3
	257, 260, 282, 330, 350, 373, 376, 380, 381, 382, 383, 384,
	// Gen 4
	392, 395, 445, 448, 461, 470, 471, 487, 493,
	// Gen 5
	571, 609, 635, 641, 643, 646,
	// Gen 6
	681, 700, 706, 720,
	// Gen 7
	745, 778, 785, 791, 792,
	// Gen 8
	813, 818, 884, 888, 890,
	// Gen 9
	906, 909, 1008,
];

function pickRandom(pool: number[], count: number): number[] {
	return [...pool].sort(() => Math.random() - 0.5).slice(0, count);
}

export const load: Load = async () => {
	try {
		const ids = pickRandom(SPOTLIGHT_POOL, 8);
		const [pokemonDetails, allSets] = await Promise.all([
			PokemonService.fetchPokemonBatch(ids),
			TcgService.fetchSets().catch(() => []),
		]);
		PokemonService.preloadFeaturedPokemon();
		// Pick 4 recent sets (last in the list tend to be newest)
		const featuredSets = allSets.slice(-4).reverse();
		return { pokemons: pokemonDetails, featuredSets };
	} catch (error) {
		console.error('Error loading featured Pokemon:', error);
		return { pokemons: [], featuredSets: [] };
	}
};