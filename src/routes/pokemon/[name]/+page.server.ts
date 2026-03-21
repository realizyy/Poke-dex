import type { Load } from '@sveltejs/kit';
import type { Pokemon, PokemonSpecies } from '$lib/types';

async function fetchWithRetry(url: string, retries = 3, timeoutMs = 20000): Promise<Response> {
	let lastError: unknown;
	for (let attempt = 1; attempt <= retries; attempt++) {
		const controller = new AbortController();
		const timer = setTimeout(() => controller.abort(), timeoutMs);
		try {
			const response = await fetch(url, { signal: controller.signal });
			clearTimeout(timer);
			return response;
		} catch (err) {
			clearTimeout(timer);
			lastError = err;
			if (attempt < retries) {
				await new Promise((r) => setTimeout(r, attempt * 600));
			}
		}
	}
	throw lastError;
}

export const load: Load = async ({ params }) => {
	try {
		const pokemonName = params.name?.toLowerCase();
		const response = await fetchWithRetry(`https://pokeapi.co/api/v2/pokemon/${pokemonName}`);

		if (!response.ok) {
			throw new Error(`Pokemon ${pokemonName} not found`);
		}

		const pokemon: Pokemon = await response.json();

		// Fetch species data for breeding info (extract ID from species URL)
		let species: PokemonSpecies | null = null;
		try {
			const speciesId = pokemon.species.url.split('/').filter(Boolean).pop();
			const speciesRes = await fetchWithRetry(
				`https://pokeapi.co/api/v2/pokemon-species/${speciesId}`
			);
			if (speciesRes.ok) {
				species = await speciesRes.json();
			}
		} catch {
			// Species data is optional — page still works without it
		}

		return { pokemon, species };
	} catch (error) {
		console.error('Error fetching Pokemon details:', error);
		return { pokemon: null, species: null };
	}
};
