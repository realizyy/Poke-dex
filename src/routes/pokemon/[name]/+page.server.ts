import { HttpError } from '$lib/api/http';
import { PokemonService } from '$lib/services/pokemon-service';
import type { PageServerLoad } from './$types';

const CACHE_CONTROL = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const pokemonName = params.name.toLowerCase();

	try {
		const pokemon = await PokemonService.fetchPokemonByName(pokemonName);
		const speciesId = Number(pokemon.species.url.split('/').filter(Boolean).pop());
		const species = await PokemonService.fetchPokemonSpecies(speciesId).catch(() => null);

		setHeaders({ 'cache-control': CACHE_CONTROL });
		return { pokemon, species };
	} catch (error) {
		if (!(error instanceof HttpError && error.status === 404)) {
			console.error('Error fetching Pokemon details:', error);
		}
		return { pokemon: null, species: null };
	}
};
