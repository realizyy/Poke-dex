<script lang="ts">
	import { onMount } from 'svelte';
	import type { Movie } from '$lib/types/movie';
	import { TMDBService } from '$lib/services/tmdb';
	import MovieGrid from '$components/MovieGrid.svelte';

	let movies: Movie[] = [];
	let loading = true;
	let error: string | null = null;
	let currentPage = 1;
	let totalPages = 0;

	onMount(async () => {
		await loadPopularMovies();
	});

	async function loadPopularMovies(page = 1) {
		try {
			loading = true;
			error = null;
			const response = await TMDBService.getPopularMovies(page);
			movies = response.results;
			currentPage = response.page;
			totalPages = response.total_pages;
		} catch (err) {
			error = 'Failed to load popular movies. Please try again.';
			console.error('Error loading popular movies:', err);
		} finally {
			loading = false;
		}
	}

	async function handleLoadMore() {
		if (currentPage < totalPages) {
			await loadPopularMovies(currentPage + 1);
			movies = [...movies, ...movies];
		}
	}
</script>

<svelte:head>
	<title>Popular Movies - Movie Library</title>
	<meta name="description" content="Discover the most popular movies of all time" />
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
				⭐ Popular Movies
			</h1>
			<p class="text-xl text-gray-300 mb-8">
				Discover the most popular and beloved films of all time
			</p>
		</div>

		<!-- Movies Grid -->
		{#if error}
			<div class="text-center py-12">
				<div class="text-red-500 text-2xl font-bold mb-4">Error</div>
				<p class="text-gray-400 text-lg">{error}</p>
			</div>
		{:else}
			<MovieGrid
				movies={movies}
				loading={loading}
				error={error}
				cardSize="medium"
				showLoadMore={currentPage < totalPages}
				onLoadMore={handleLoadMore}
			/>
		{/if}

		<!-- Info Section -->
		<div class="bg-gray-800 rounded-lg p-8 mt-12">
			<h2 class="text-2xl font-bold mb-6 text-center">About Popular Movies</h2>
			<div class="grid md:grid-cols-2 gap-8">
				<div>
					<h3 class="text-lg font-semibold mb-3">What Makes a Movie Popular?</h3>
					<p class="text-gray-400 leading-relaxed">
						Popular movies are determined by TMDB's popularity algorithm that considers:
						user ratings, vote counts, page views, and overall engagement. These films
						have captured the hearts and minds of audiences worldwide.
					</p>
				</div>
				<div>
					<h3 class="text-lg font-semibold mb-3">Discover Classics & New Favorites</h3>
					<p class="text-gray-400 leading-relaxed">
						From timeless classics to modern blockbusters, the popular movies list
						includes films from all eras and genres. Whether you're looking for
						entertainment or cinematic excellence, you'll find it here.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>