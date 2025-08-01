<script lang="ts">
	import { onMount } from 'svelte';
	import type { Movie } from '$lib/types/movie';
	import { TMDBService } from '$lib/services/tmdb';
	import MovieGrid from '$components/MovieGrid.svelte';
	import SearchBar from '$components/SearchBar.svelte';

	let popularMovies: Movie[] = [];
	let trendingMovies: Movie[] = [];
	let topRatedMovies: Movie[] = [];
	let nowPlayingMovies: Movie[] = [];
	let loading = true;
	let error: string | null = null;

	onMount(async () => {
		try {
			loading = true;
			const [popular, trending, topRated, nowPlaying] = await Promise.all([
				TMDBService.getPopularMovies(),
				TMDBService.getTrendingMovies(),
				TMDBService.getTopRatedMovies(),
				TMDBService.getNowPlayingMovies()
			]);

			popularMovies = popular.results;
			trendingMovies = trending.results;
			topRatedMovies = topRated.results;
			nowPlayingMovies = nowPlaying.results;
		} catch (err) {
			error = 'Failed to load movies. Please try again later.';
			console.error('Error loading movies:', err);
		} finally {
			loading = false;
		}
	});

	function handleSearch(event: CustomEvent<string>) {
		const query = event.detail;
		if (query) {
			window.location.href = `/search?q=${encodeURIComponent(query)}`;
		}
	}
</script>

<svelte:head>
	<title>Movie Library - Discover Amazing Films</title>
	<meta name="description" content="Discover and explore thousands of movies with personalized recommendations" />
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
	<!-- Hero Section -->
	<div class="relative bg-gradient-to-r from-blue-900 to-purple-900 py-20">
		<div class="container mx-auto px-4">
			<div class="text-center max-w-4xl mx-auto">
				<h1 class="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
					Discover Amazing Films
				</h1>
				<p class="text-xl text-gray-300 mb-8">
					Explore thousands of movies with personalized recommendations powered by TMDB
				</p>
				
				<SearchBar on:search={handleSearch} />
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-12">
		{#if error}
			<div class="text-center py-12">
				<div class="text-red-500 text-2xl font-bold mb-4">Oops!</div>
				<p class="text-gray-400 text-lg">{error}</p>
			</div>
		{:else}
			<!-- Trending Movies -->
			<section class="mb-16">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-3xl font-bold text-white">🔥 Trending This Week</h2>
					<a href="/trending" class="text-blue-400 hover:text-blue-300 transition-colors duration-200">
						View All →
					</a>
				</div>
				<MovieGrid movies={trendingMovies} loading={loading} cardSize="medium" />
			</section>

			<!-- Popular Movies -->
			<section class="mb-16">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-3xl font-bold text-white">⭐ Popular Movies</h2>
					<a href="/popular" class="text-blue-400 hover:text-blue-300 transition-colors duration-200">
						View All →
					</a>
				</div>
				<MovieGrid movies={popularMovies} loading={loading} cardSize="medium" />
			</section>

			<!-- Now Playing -->
			<section class="mb-16">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-3xl font-bold text-white">🎬 Now Playing</h2>
					<a href="/now-playing" class="text-blue-400 hover:text-blue-300 transition-colors duration-200">
						View All →
					</a>
				</div>
				<MovieGrid movies={nowPlayingMovies} loading={loading} cardSize="medium" />
			</section>

			<!-- Top Rated -->
			<section class="mb-16">
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-3xl font-bold text-white">🏆 Top Rated</h2>
					<a href="/top-rated" class="text-blue-400 hover:text-blue-300 transition-colors duration-200">
						View All →
					</a>
				</div>
				<MovieGrid movies={topRatedMovies} loading={loading} cardSize="medium" />
			</section>

			<!-- Features Section -->
			<section class="bg-gray-800 rounded-2xl p-8 mb-16">
				<h2 class="text-3xl font-bold text-white mb-8 text-center">Why Choose Our Movie Library?</h2>
				<div class="grid md:grid-cols-3 gap-8">
					<div class="text-center">
						<div class="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Smart Recommendations</h3>
						<p class="text-gray-400">Get personalized movie suggestions based on your preferences and viewing history.</p>
					</div>
					
					<div class="text-center">
						<div class="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Comprehensive Search</h3>
						<p class="text-gray-400">Find movies by title, genre, year, rating, and more with advanced filtering options.</p>
					</div>
					
					<div class="text-center">
						<div class="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
							<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
								<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
							</svg>
						</div>
						<h3 class="text-xl font-semibold mb-2">Real-time Data</h3>
						<p class="text-gray-400">Access the latest movie information, ratings, and reviews from TMDB's extensive database.</p>
					</div>
				</div>
			</section>
		{/if}
	</div>
</div>