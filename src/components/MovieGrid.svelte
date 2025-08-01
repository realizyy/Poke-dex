<script lang="ts">
	import type { Movie } from '$lib/types/movie';
	import MovieCard from './MovieCard.svelte';

	export let movies: Movie[] = [];
	export let loading = false;
	export let error: string | null = null;
	export let cardSize: 'small' | 'medium' | 'large' = 'medium';
	export let showLoadMore = false;
	export let onLoadMore: (() => void) | null = null;

	$: gridClasses = {
		'grid gap-6': true,
		'grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6': cardSize === 'small',
		'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5': cardSize === 'medium',
		'grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4': cardSize === 'large'
	};
</script>

<div class="space-y-6">
	{#if error}
		<div class="text-center py-8">
			<div class="text-red-500 text-lg font-semibold mb-2">Error</div>
			<p class="text-gray-600">{error}</p>
		</div>
	{:else if loading && movies.length === 0}
		<div class="grid gap-6 {Object.entries(gridClasses).map(([k, v]) => v ? k : '').filter(Boolean).join(' ')}">
			{#each Array(12) as _}
				<div class="animate-pulse">
					<div class="bg-gray-700 rounded-lg h-80 w-56"></div>
				</div>
			{/each}
		</div>
	{:else if movies.length === 0}
		<div class="text-center py-12">
			<div class="text-gray-500 text-lg font-semibold mb-2">No movies found</div>
			<p class="text-gray-400">Try adjusting your search criteria or filters.</p>
		</div>
	{:else}
		<div class={Object.entries(gridClasses).map(([k, v]) => v ? k : '').filter(Boolean).join(' ')}>
			{#each movies as movie (movie.id)}
				<a href="/movie/{movie.id}" class="block">
					<MovieCard {movie} size={cardSize} />
				</a>
			{/each}
		</div>

		{#if loading && movies.length > 0}
			<div class="flex justify-center py-8">
				<div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
			</div>
		{/if}

		{#if showLoadMore && onLoadMore && !loading}
			<div class="flex justify-center py-8">
				<button
					on:click={onLoadMore}
					class="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
				>
					Load More
				</button>
			</div>
		{/if}
	{/if}
</div>