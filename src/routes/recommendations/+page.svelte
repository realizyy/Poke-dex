<script lang="ts">
	import { onMount } from 'svelte';
	import type { MovieRecommendation, UserPreferences, Genre } from '$lib/types/movie';
	import { TMDBService } from '$lib/services/tmdb';
	import RecommendationCard from '$components/RecommendationCard.svelte';
	import MovieGrid from '$components/MovieGrid.svelte';

	let recommendations: MovieRecommendation[] = [];
	let genres: Genre[] = [];
	let loading = false;
	let error: string | null = null;
	let showPreferences = false;

	// User preferences
	let preferences: UserPreferences = {
		favoriteGenres: [],
		preferredLanguages: ['en'],
		minRating: 7.0,
		includeAdult: false,
		yearRange: {
			min: 2000,
			max: new Date().getFullYear()
		}
	};

	onMount(async () => {
		await loadGenres();
		await loadRecommendations();
	});

	async function loadGenres() {
		try {
			const response = await TMDBService.getGenres();
			genres = response.genres;
		} catch (err) {
			console.error('Error loading genres:', err);
		}
	}

	async function loadRecommendations() {
		try {
			loading = true;
			error = null;
			recommendations = await TMDBService.getPersonalizedRecommendations(preferences);
		} catch (err) {
			error = 'Failed to load recommendations. Please try again.';
			console.error('Error loading recommendations:', err);
		} finally {
			loading = false;
		}
	}

	function toggleGenre(genreId: number) {
		preferences.favoriteGenres = preferences.favoriteGenres.includes(genreId)
			? preferences.favoriteGenres.filter(id => id !== genreId)
			: [...preferences.favoriteGenres, genreId];
	}

	function updatePreferences() {
		loadRecommendations();
		showPreferences = false;
	}

	function resetPreferences() {
		preferences = {
			favoriteGenres: [],
			preferredLanguages: ['en'],
			minRating: 7.0,
			includeAdult: false,
			yearRange: {
				min: 2000,
				max: new Date().getFullYear()
			}
		};
		loadRecommendations();
	}
</script>

<svelte:head>
	<title>Personalized Recommendations - Movie Library</title>
	<meta name="description" content="Get personalized movie recommendations based on your preferences" />
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
	<div class="container mx-auto px-4 py-8">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
				Your Personalized Recommendations
			</h1>
			<p class="text-xl text-gray-300 mb-8">
				Discover movies tailored to your taste based on your preferences
			</p>
			
			<div class="flex flex-col sm:flex-row gap-4 justify-center">
				<button
					on:click={() => showPreferences = !showPreferences}
					class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
				>
					{showPreferences ? 'Hide' : 'Customize'} Preferences
				</button>
				
				<button
					on:click={resetPreferences}
					class="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 font-medium"
				>
					Reset Preferences
				</button>
			</div>
		</div>

		<!-- Preferences Panel -->
		{#if showPreferences}
			<div class="bg-gray-800 rounded-lg p-6 mb-8">
				<h2 class="text-2xl font-bold mb-6">Your Movie Preferences</h2>
				
				<div class="grid md:grid-cols-2 gap-8">
					<!-- Favorite Genres -->
					<div>
						<h3 class="text-lg font-semibold mb-4">Favorite Genres</h3>
						<div class="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
							{#each genres as genre}
								<label class="flex items-center cursor-pointer p-2 rounded hover:bg-gray-700">
									<input
										type="checkbox"
										checked={preferences.favoriteGenres.includes(genre.id)}
										on:change={() => toggleGenre(genre.id)}
										class="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
									/>
									<span class="ml-2 text-sm">{genre.name}</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Other Preferences -->
					<div class="space-y-6">
						<!-- Minimum Rating -->
						<div>
							<h3 class="text-lg font-semibold mb-2">Minimum Rating</h3>
							<div class="flex items-center gap-4">
								<input
									type="range"
									bind:value={preferences.minRating}
									min="0"
									max="10"
									step="0.5"
									class="flex-1"
								/>
								<span class="text-lg font-semibold">{preferences.minRating}</span>
							</div>
						</div>

						<!-- Year Range -->
						<div>
							<h3 class="text-lg font-semibold mb-2">Year Range</h3>
							<div class="grid grid-cols-2 gap-4">
								<div>
									<label class="block text-sm text-gray-400 mb-1">From</label>
									<input
										type="number"
										bind:value={preferences.yearRange.min}
										min="1900"
										max="2030"
										class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
									/>
								</div>
								<div>
									<label class="block text-sm text-gray-400 mb-1">To</label>
									<input
										type="number"
										bind:value={preferences.yearRange.max}
										min="1900"
										max="2030"
										class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
									/>
								</div>
							</div>
						</div>

						<!-- Include Adult Content -->
						<div>
							<label class="flex items-center cursor-pointer">
								<input
									type="checkbox"
									bind:checked={preferences.includeAdult}
									class="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
								/>
								<span class="ml-2">Include adult content</span>
							</label>
						</div>
					</div>
				</div>

				<!-- Action Buttons -->
				<div class="flex gap-4 mt-6">
					<button
						on:click={updatePreferences}
						class="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200"
					>
						Update Recommendations
					</button>
					<button
						on:click={() => showPreferences = false}
						class="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200"
					>
						Cancel
					</button>
				</div>
			</div>
		{/if}

		<!-- Current Preferences Summary -->
		{#if !showPreferences && (preferences.favoriteGenres.length > 0 || preferences.minRating > 0)}
			<div class="bg-gray-800 rounded-lg p-4 mb-8">
				<h3 class="text-lg font-semibold mb-2">Current Preferences</h3>
				<div class="flex flex-wrap gap-2 text-sm">
					{#if preferences.favoriteGenres.length > 0}
						<span class="px-2 py-1 bg-blue-600 text-white rounded-full">
							{preferences.favoriteGenres.length} genre{preferences.favoriteGenres.length !== 1 ? 's' : ''} selected
						</span>
					{/if}
					{#if preferences.minRating > 0}
						<span class="px-2 py-1 bg-green-600 text-white rounded-full">
							Rating ≥ {preferences.minRating}
						</span>
					{/if}
					<span class="px-2 py-1 bg-purple-600 text-white rounded-full">
						{preferences.yearRange.min} - {preferences.yearRange.max}
					</span>
				</div>
			</div>
		{/if}

		<!-- Recommendations -->
		{#if error}
			<div class="text-center py-12">
				<div class="text-red-500 text-2xl font-bold mb-4">Error</div>
				<p class="text-gray-400 text-lg">{error}</p>
			</div>
		{:else if loading}
			<div class="text-center py-12">
				<div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
				<p class="text-gray-400">Finding the perfect movies for you...</p>
			</div>
		{:else if recommendations.length === 0}
			<div class="text-center py-12">
				<div class="text-gray-500 text-2xl font-bold mb-4">No Recommendations Found</div>
				<p class="text-gray-400 text-lg mb-6">
					Try adjusting your preferences to get more movie suggestions.
				</p>
				<button
					on:click={() => showPreferences = true}
					class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
				>
					Adjust Preferences
				</button>
			</div>
		{:else}
			<div class="mb-8">
				<h2 class="text-2xl font-bold mb-4">Top Recommendations</h2>
				<p class="text-gray-400 mb-6">
					Based on your preferences, here are movies we think you'll love:
				</p>
			</div>

			<!-- Top Recommendations -->
			<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6 mb-12">
				{#each recommendations.slice(0, 10) as recommendation}
					<a href="/movie/{recommendation.movie.id}" class="block">
						<RecommendationCard {recommendation} />
					</a>
				{/each}
			</div>

			<!-- All Recommendations -->
			{#if recommendations.length > 10}
				<div class="mb-8">
					<h2 class="text-2xl font-bold mb-4">More Recommendations</h2>
				</div>
				<MovieGrid 
					movies={recommendations.slice(10).map(r => r.movie)} 
					cardSize="medium" 
				/>
			{/if}
		{/if}

		<!-- How It Works -->
		<div class="bg-gray-800 rounded-lg p-8 mt-12">
			<h2 class="text-2xl font-bold mb-6 text-center">How Our Recommendations Work</h2>
			<div class="grid md:grid-cols-3 gap-6">
				<div class="text-center">
					<div class="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold mb-2">Smart Matching</h3>
					<p class="text-gray-400 text-sm">
						We analyze your genre preferences, rating requirements, and year range to find perfect matches.
					</p>
				</div>
				
				<div class="text-center">
					<div class="bg-green-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold mb-2">Real-time Scoring</h3>
					<p class="text-gray-400 text-sm">
						Each movie gets a personalized score based on how well it matches your preferences.
					</p>
				</div>
				
				<div class="text-center">
					<div class="bg-purple-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
						</svg>
					</div>
					<h3 class="text-lg font-semibold mb-2">Personalized Results</h3>
					<p class="text-gray-400 text-sm">
						Get recommendations that are uniquely tailored to your taste and preferences.
					</p>
				</div>
			</div>
		</div>
	</div>
</div>