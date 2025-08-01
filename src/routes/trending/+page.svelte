<script lang="ts">
	import { onMount } from 'svelte';
	import type { Movie } from '$lib/types/movie';
	import { TMDBService } from '$lib/services/tmdb';
	import MovieGrid from '$components/MovieGrid.svelte';

	let movies: Movie[] = [];
	let loading = true;
	let error: string | null = null;
	let timeWindow = 'week';
	let currentPage = 1;
	let totalPages = 0;

	onMount(async () => {
		await loadTrendingMovies();
	});

	async function loadTrendingMovies(page = 1) {
		try {
			loading = true;
			error = null;
			const response = await TMDBService.getTrendingMovies(timeWindow as 'day' | 'week', page);
			movies = response.results;
			currentPage = response.page;
			totalPages = response.total_pages;
		} catch (err) {
			error = 'Failed to load trending movies. Please try again.';
			console.error('Error loading trending movies:', err);
		} finally {
			loading = false;
		}
	}

	async function handleLoadMore() {
		if (currentPage < totalPages) {
			await loadTrendingMovies(currentPage + 1);
			movies = [...movies, ...movies];
		}
	}

	function changeTimeWindow(newWindow: 'day' | 'week') {
		timeWindow = newWindow;
		loadTrendingMovies();
	}
</script>

<svelte:head>
	<title>Trending Movies - Movie Library</title>
	<meta name="description" content="Discover trending movies that are popular right now" />
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
				🔥 Trending Movies
			</h1>
			<p class="text-xl text-gray-300 mb-8">
				Discover what's popular and trending right now
			</p>

			<!-- Time Window Toggle -->
			<div class="flex justify-center gap-4 mb-8">
				<button
					on:click={() => changeTimeWindow('day')}
					class="px-6 py-3 rounded-lg font-medium transition-colors duration-200 {timeWindow === 'day' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
				>
					Today
				</button>
				<button
					on:click={() => changeTimeWindow('week')}
					class="px-6 py-3 rounded-lg font-medium transition-colors duration-200 {timeWindow === 'week' ? 'bg-orange-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}"
				>
					This Week
				</button>
			</div>
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
			<h2 class="text-2xl font-bold mb-6 text-center">About Trending Movies</h2>
			<div class="grid md:grid-cols-2 gap-8">
				<div>
					<h3 class="text-lg font-semibold mb-3">How Trending Works</h3>
					<p class="text-gray-400 leading-relaxed">
						Trending movies are determined by TMDB's algorithm that considers factors like:
						search volume, page views, user ratings, and social media mentions. 
						This gives you a real-time view of what's capturing people's attention.
					</p>
				</div>
				<div>
					<h3 class="text-lg font-semibold mb-3">Stay Updated</h3>
					<p class="text-gray-400 leading-relaxed">
						Check back regularly to see what's trending. The list updates frequently 
						to reflect the latest buzz in the movie world. You can view trending 
						movies for today or the entire week.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>