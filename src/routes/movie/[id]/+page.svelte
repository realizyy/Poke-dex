<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { MovieDetails, MovieRecommendation } from '$lib/types/movie';
	import { TMDBService, getPosterUrl, getBackdropUrl } from '$lib/services/tmdb';
	import MovieGrid from '$components/MovieGrid.svelte';
	import RecommendationCard from '$components/RecommendationCard.svelte';

	let movie: MovieDetails | null = null;
	let recommendations: MovieRecommendation[] = [];
	let similarMovies: MovieDetails[] = [];
	let loading = true;
	let error: string | null = null;
	let activeTab = 'overview';

	$: movieId = parseInt($page.params.id);

	onMount(async () => {
		await loadMovieDetails();
	});

	async function loadMovieDetails() {
		try {
			loading = true;
			error = null;

			const [movieDetails, recommendationsData, similarData] = await Promise.all([
				TMDBService.getMovieDetails(movieId),
				TMDBService.getMovieRecommendations(movieId),
				TMDBService.getSimilarMovies(movieId)
			]);

			movie = movieDetails;
			similarMovies = similarData.results;

			// Convert recommendations to our format
			recommendations = recommendationsData.results.map(movie => ({
				movie,
				score: Math.round(movie.vote_average * 10),
				reason: `Similar to ${movieDetails.title}`
			}));

		} catch (err) {
			error = 'Failed to load movie details. Please try again.';
			console.error('Error loading movie details:', err);
		} finally {
			loading = false;
		}
	}

	$: backdropUrl = movie?.backdrop_path ? getBackdropUrl(movie.backdrop_path) : '';
	$: posterUrl = movie?.poster_path ? getPosterUrl(movie.poster_path, 'w500') : '';
	$: releaseYear = movie?.release_date ? new Date(movie.release_date).getFullYear() : '';
	$: runtime = movie?.runtime ? `${Math.floor(movie.runtime / 60)}h ${movie.runtime % 60}m` : '';
	$: rating = movie?.vote_average ? movie.vote_average.toFixed(1) : '';
	$: budget = movie?.budget ? `$${(movie.budget / 1000000).toFixed(1)}M` : '';
	$: revenue = movie?.revenue ? `$${(movie.revenue / 1000000).toFixed(1)}M` : '';
</script>

<svelte:head>
	<title>{movie?.title || 'Movie'} - Movie Library</title>
	<meta name="description" content={movie?.overview || 'Movie details and information'} />
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
	{#if loading}
		<div class="flex justify-center items-center h-screen">
			<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
		</div>
	{:else if error}
		<div class="container mx-auto px-4 py-12">
			<div class="text-center">
				<div class="text-red-500 text-2xl font-bold mb-4">Error</div>
				<p class="text-gray-400 text-lg">{error}</p>
			</div>
		</div>
	{:else if movie}
		<!-- Hero Section with Backdrop -->
		<div class="relative h-96 md:h-[500px] overflow-hidden">
			{#if backdropUrl}
				<img
					src={backdropUrl}
					alt={movie.title}
					class="w-full h-full object-cover"
				/>
			{/if}
			<div class="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/50 to-transparent"></div>
			
			<!-- Movie Info Overlay -->
			<div class="absolute bottom-0 left-0 right-0 p-6 md:p-8">
				<div class="container mx-auto">
					<div class="flex flex-col md:flex-row gap-6 md:gap-8">
						<!-- Poster -->
						<div class="flex-shrink-0">
							<img
								src={posterUrl}
								alt={movie.title}
								class="w-48 h-72 md:w-64 md:h-96 rounded-lg shadow-2xl"
							/>
						</div>
						
						<!-- Movie Info -->
						<div class="flex-1">
							<h1 class="text-4xl md:text-5xl font-bold mb-4">{movie.title}</h1>
							
							<div class="flex flex-wrap items-center gap-4 mb-4 text-gray-300">
								{#if releaseYear}
									<span>{releaseYear}</span>
								{/if}
								{#if runtime}
									<span>•</span>
									<span>{runtime}</span>
								{/if}
								{#if movie.status}
									<span>•</span>
									<span>{movie.status}</span>
								{/if}
							</div>
							
							<!-- Genres -->
							{#if movie.genres?.length}
								<div class="flex flex-wrap gap-2 mb-4">
									{#each movie.genres as genre}
										<span class="px-3 py-1 bg-blue-600 text-white rounded-full text-sm">
											{genre.name}
										</span>
									{/each}
								</div>
							{/if}
							
							<!-- Rating -->
							{#if rating}
								<div class="flex items-center gap-2 mb-4">
									<div class="flex items-center">
										<svg class="w-5 h-5 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
											<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
										</svg>
										<span class="text-lg font-semibold">{rating}/10</span>
									</div>
									<span class="text-gray-400">({movie.vote_count} votes)</span>
								</div>
							{/if}
							
							<!-- Tagline -->
							{#if movie.tagline}
								<p class="text-xl text-gray-300 italic mb-4">"{movie.tagline}"</p>
							{/if}
							
							<!-- Overview -->
							{#if movie.overview}
								<p class="text-lg text-gray-300 leading-relaxed max-w-3xl">
									{movie.overview}
								</p>
							{/if}
						</div>
					</div>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="container mx-auto px-4 py-8">
			<!-- Tabs -->
			<div class="border-b border-gray-700 mb-8">
				<nav class="flex space-x-8">
					<button
						on:click={() => activeTab = 'overview'}
						class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'overview' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}"
					>
						Overview
					</button>
					<button
						on:click={() => activeTab = 'cast'}
						class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'cast' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}"
					>
						Cast & Crew
					</button>
					<button
						on:click={() => activeTab = 'details'}
						class="py-2 px-1 border-b-2 font-medium text-sm {activeTab === 'details' ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-400 hover:text-gray-300'}"
					>
						Details
					</button>
				</nav>
			</div>

			<!-- Tab Content -->
			{#if activeTab === 'overview'}
				<div class="grid lg:grid-cols-3 gap-8">
					<!-- Main Info -->
					<div class="lg:col-span-2">
						<h2 class="text-2xl font-bold mb-6">Overview</h2>
						{#if movie.overview}
							<p class="text-gray-300 leading-relaxed mb-6">{movie.overview}</p>
						{/if}
						
						<!-- Videos -->
						{#if movie.videos?.results?.length}
							<div class="mb-8">
								<h3 class="text-xl font-semibold mb-4">Videos</h3>
								<div class="grid md:grid-cols-2 gap-4">
									{#each movie.videos.results.slice(0, 4) as video}
										<div class="bg-gray-800 rounded-lg overflow-hidden">
											<iframe
												src="https://www.youtube.com/embed/{video.key}"
												title={video.name}
												class="w-full h-48"
												frameborder="0"
												allowfullscreen
											></iframe>
											<div class="p-4">
												<h4 class="font-semibold">{video.name}</h4>
												<p class="text-sm text-gray-400">{video.type}</p>
											</div>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>

					<!-- Sidebar -->
					<div class="space-y-6">
						<!-- Quick Stats -->
						<div class="bg-gray-800 rounded-lg p-6">
							<h3 class="text-lg font-semibold mb-4">Quick Stats</h3>
							<div class="space-y-3">
								{#if budget}
									<div class="flex justify-between">
										<span class="text-gray-400">Budget:</span>
										<span>{budget}</span>
									</div>
								{/if}
								{#if revenue}
									<div class="flex justify-between">
										<span class="text-gray-400">Revenue:</span>
										<span>{revenue}</span>
									</div>
								{/if}
								{#if movie.popularity}
									<div class="flex justify-between">
										<span class="text-gray-400">Popularity:</span>
										<span>{movie.popularity.toFixed(0)}</span>
									</div>
								{/if}
							</div>
						</div>

						<!-- Production Companies -->
						{#if movie.production_companies?.length}
							<div class="bg-gray-800 rounded-lg p-6">
								<h3 class="text-lg font-semibold mb-4">Production Companies</h3>
								<div class="space-y-2">
									{#each movie.production_companies as company}
										<div class="flex items-center gap-2">
											{#if company.logo_path}
												<img
													src="https://image.tmdb.org/t/p/w45{company.logo_path}"
													alt={company.name}
													class="w-8 h-8 object-contain"
												/>
											{/if}
											<span class="text-sm">{company.name}</span>
										</div>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				</div>
			{:else if activeTab === 'cast'}
				<div>
					<h2 class="text-2xl font-bold mb-6">Cast & Crew</h2>
					
					<!-- Cast -->
					{#if movie.credits?.cast?.length}
						<div class="mb-8">
							<h3 class="text-xl font-semibold mb-4">Cast</h3>
							<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
								{#each movie.credits.cast.slice(0, 12) as actor}
									<div class="bg-gray-800 rounded-lg p-4">
										{#if actor.profile_path}
											<img
												src="https://image.tmdb.org/t/p/w185{actor.profile_path}"
												alt={actor.name}
												class="w-full h-48 object-cover rounded-lg mb-3"
											/>
										{:else}
											<div class="w-full h-48 bg-gray-700 rounded-lg mb-3 flex items-center justify-center">
												<svg class="w-12 h-12 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
													<path fill-rule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clip-rule="evenodd"/>
												</svg>
											</div>
										{/if}
										<h4 class="font-semibold text-sm">{actor.name}</h4>
										<p class="text-xs text-gray-400">{actor.character}</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}

					<!-- Crew -->
					{#if movie.credits?.crew?.length}
						<div>
							<h3 class="text-xl font-semibold mb-4">Crew</h3>
							<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
								{#each movie.credits.crew.slice(0, 9) as crew}
									<div class="bg-gray-800 rounded-lg p-4">
										<h4 class="font-semibold">{crew.name}</h4>
										<p class="text-sm text-gray-400">{crew.job}</p>
										<p class="text-xs text-gray-500">{crew.department}</p>
									</div>
								{/each}
							</div>
						</div>
					{/if}
				</div>
			{:else if activeTab === 'details'}
				<div class="grid md:grid-cols-2 gap-8">
					<div>
						<h3 class="text-lg font-semibold mb-4">Production Details</h3>
						<div class="space-y-3">
							{#if movie.status}
								<div class="flex justify-between">
									<span class="text-gray-400">Status:</span>
									<span>{movie.status}</span>
								</div>
							{/if}
							{#if movie.original_language}
								<div class="flex justify-between">
									<span class="text-gray-400">Original Language:</span>
									<span class="uppercase">{movie.original_language}</span>
								</div>
							{/if}
							{#if movie.budget}
								<div class="flex justify-between">
									<span class="text-gray-400">Budget:</span>
									<span>{budget}</span>
								</div>
							{/if}
							{#if movie.revenue}
								<div class="flex justify-between">
									<span class="text-gray-400">Revenue:</span>
									<span>{revenue}</span>
								</div>
							{/if}
						</div>
					</div>

					<div>
						<h3 class="text-lg font-semibold mb-4">Additional Information</h3>
						<div class="space-y-3">
							{#if movie.homepage}
								<div class="flex justify-between">
									<span class="text-gray-400">Homepage:</span>
									<a href={movie.homepage} target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300">
										Visit Site
									</a>
								</div>
							{/if}
							{#if movie.imdb_id}
								<div class="flex justify-between">
									<span class="text-gray-400">IMDB:</span>
									<a href="https://www.imdb.com/title/{movie.imdb_id}" target="_blank" rel="noopener noreferrer" class="text-blue-400 hover:text-blue-300">
										View on IMDB
									</a>
								</div>
							{/if}
						</div>
					</div>
				</div>
			{/if}
		</div>

		<!-- Recommendations -->
		{#if recommendations.length > 0}
			<div class="container mx-auto px-4 py-8">
				<h2 class="text-2xl font-bold mb-6">Recommended Movies</h2>
				<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
					{#each recommendations.slice(0, 10) as recommendation}
						<a href="/movie/{recommendation.movie.id}" class="block">
							<RecommendationCard {recommendation} />
						</a>
					{/each}
				</div>
			</div>
		{/if}

		<!-- Similar Movies -->
		{#if similarMovies.length > 0}
			<div class="container mx-auto px-4 py-8">
				<h2 class="text-2xl font-bold mb-6">Similar Movies</h2>
				<MovieGrid movies={similarMovies.slice(0, 20)} cardSize="medium" />
			</div>
		{/if}
	{/if}
</div>