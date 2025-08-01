<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import type { Movie, Genre } from '$lib/types/movie';
	import { TMDBService } from '$lib/services/tmdb';
	import MovieGrid from '$components/MovieGrid.svelte';
	import SearchBar from '$components/SearchBar.svelte';

	let movies: Movie[] = [];
	let genres: Genre[] = [];
	let loading = false;
	let error: string | null = null;
	let currentPage = 1;
	let totalPages = 0;
	let totalResults = 0;
	let searchQuery = '';
	let selectedGenres: number[] = [];
	let minRating = 0;
	let sortBy = 'popularity.desc';
	let yearFrom = '';
	let yearTo = '';

	$: pageData = $page;
	$: urlQuery = pageData.url.searchParams.get('q') || '';

	onMount(async () => {
		await loadGenres();
		if (urlQuery) {
			searchQuery = urlQuery;
			await performSearch();
		}
	});

	async function loadGenres() {
		try {
			const response = await TMDBService.getGenres();
			genres = response.genres;
		} catch (err) {
			console.error('Error loading genres:', err);
		}
	}

	async function performSearch(page = 1) {
		if (!searchQuery.trim()) return;

		try {
			loading = true;
			error = null;

			const params: any = {
				page,
				sort_by: sortBy,
				'vote_average.gte': minRating
			};

			if (selectedGenres.length > 0) {
				params.with_genres = selectedGenres.join(',');
			}

			if (yearFrom) {
				params['primary_release_date.gte'] = `${yearFrom}-01-01`;
			}

			if (yearTo) {
				params['primary_release_date.lte'] = `${yearTo}-12-31`;
			}

			const response = await TMDBService.discoverMovies(params);
			movies = response.results;
			currentPage = response.page;
			totalPages = response.total_pages;
			totalResults = response.total_results;
		} catch (err) {
			error = 'Failed to search movies. Please try again.';
			console.error('Search error:', err);
		} finally {
			loading = false;
		}
	}

	async function handleSearch(event: CustomEvent<string>) {
		searchQuery = event.detail;
		if (searchQuery.trim()) {
			await performSearch();
		}
	}

	async function handleLoadMore() {
		if (currentPage < totalPages) {
			await performSearch(currentPage + 1);
			movies = [...movies, ...movies];
		}
	}

	function toggleGenre(genreId: number) {
		selectedGenres = selectedGenres.includes(genreId)
			? selectedGenres.filter(id => id !== genreId)
			: [...selectedGenres, genreId];
	}

	async function applyFilters() {
		await performSearch();
	}

	function clearFilters() {
		selectedGenres = [];
		minRating = 0;
		sortBy = 'popularity.desc';
		yearFrom = '';
		yearTo = '';
	}
</script>

<svelte:head>
	<title>Search Movies - Movie Library</title>
	<meta name="description" content="Search and discover movies with advanced filtering options" />
</svelte:head>

<div class="min-h-screen bg-gray-900 text-white">
	<div class="container mx-auto px-4 py-8">
		<!-- Search Header -->
		<div class="mb-8">
			<h1 class="text-4xl font-bold mb-4">Search Movies</h1>
			<SearchBar on:search={handleSearch} />
		</div>

		<div class="grid lg:grid-cols-4 gap-8">
			<!-- Filters Sidebar -->
			<div class="lg:col-span-1">
				<div class="bg-gray-800 rounded-lg p-6 sticky top-4">
					<h2 class="text-xl font-semibold mb-6">Filters</h2>

					<!-- Genres -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-3">Genres</h3>
						<div class="space-y-2 max-h-48 overflow-y-auto">
							{#each genres as genre}
								<label class="flex items-center cursor-pointer">
									<input
										type="checkbox"
										checked={selectedGenres.includes(genre.id)}
										on:change={() => toggleGenre(genre.id)}
										class="rounded border-gray-600 text-blue-600 focus:ring-blue-500"
									/>
									<span class="ml-2 text-sm">{genre.name}</span>
								</label>
							{/each}
						</div>
					</div>

					<!-- Rating -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-3">Minimum Rating</h3>
						<input
							type="range"
							bind:value={minRating}
							min="0"
							max="10"
							step="0.5"
							class="w-full"
						/>
						<div class="flex justify-between text-sm text-gray-400 mt-1">
							<span>0</span>
							<span>{minRating}</span>
							<span>10</span>
						</div>
					</div>

					<!-- Sort By -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-3">Sort By</h3>
						<select
							bind:value={sortBy}
							class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
						>
							<option value="popularity.desc">Popularity</option>
							<option value="vote_average.desc">Rating</option>
							<option value="release_date.desc">Release Date (Newest)</option>
							<option value="release_date.asc">Release Date (Oldest)</option>
							<option value="title.asc">Title A-Z</option>
							<option value="title.desc">Title Z-A</option>
						</select>
					</div>

					<!-- Year Range -->
					<div class="mb-6">
						<h3 class="text-lg font-medium mb-3">Year Range</h3>
						<div class="grid grid-cols-2 gap-2">
							<div>
								<label class="block text-sm text-gray-400 mb-1">From</label>
								<input
									type="number"
									bind:value={yearFrom}
									min="1900"
									max="2030"
									placeholder="1900"
									class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
								/>
							</div>
							<div>
								<label class="block text-sm text-gray-400 mb-1">To</label>
								<input
									type="number"
									bind:value={yearTo}
									min="1900"
									max="2030"
									placeholder="2030"
									class="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
								/>
							</div>
						</div>
					</div>

					<!-- Action Buttons -->
					<div class="space-y-2">
						<button
							on:click={applyFilters}
							class="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors duration-200"
						>
							Apply Filters
						</button>
						<button
							on:click={clearFilters}
							class="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors duration-200"
						>
							Clear Filters
						</button>
					</div>
				</div>
			</div>

			<!-- Search Results -->
			<div class="lg:col-span-3">
				{#if searchQuery}
					<div class="mb-6">
						<h2 class="text-2xl font-semibold mb-2">
							Search Results for "{searchQuery}"
						</h2>
						{#if totalResults > 0}
							<p class="text-gray-400">
								Found {totalResults} movie{totalResults !== 1 ? 's' : ''}
								{#if selectedGenres.length > 0}
									in {selectedGenres.map(id => genres.find(g => g.id === id)?.name).filter(Boolean).join(', ')}
								{/if}
							</p>
						{/if}
					</div>
				{/if}

				<MovieGrid
					movies={movies}
					loading={loading}
					error={error}
					cardSize="medium"
					showLoadMore={currentPage < totalPages}
					onLoadMore={handleLoadMore}
				/>
			</div>
		</div>
	</div>
</div> 