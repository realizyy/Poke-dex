import { error } from '@sveltejs/kit';
import { HttpError } from '#lib/api/http';
import { PokemonService } from '#lib/services/pokemon-service';
import type { Pokemon } from '#lib/types';
import type { PageServerLoad } from './$types';

const CACHE_CONTROL = 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400';

export const load: PageServerLoad = async ({ params, setHeaders }) => {
	const pokemonName = params.name.toLowerCase();

	let pokemon: Pokemon;
	try {
		pokemon = await PokemonService.fetchPokemonByName(pokemonName);
	} catch (cause) {
		if (cause instanceof HttpError && cause.status === 404) {
			error(404, `Pokémon "${params.name}" was not found`);
		}
		console.error('Error fetching Pokemon details:', cause);
		error(502, 'PokeAPI is not responding. Please try again in a moment.');
	}

	const speciesId = Number(pokemon.species.url.split('/').filter(Boolean).pop());
	const species = await PokemonService.fetchPokemonSpecies(speciesId).catch(() => null);

	setHeaders({ 'cache-control': CACHE_CONTROL });
	return { pokemon, species };
};
