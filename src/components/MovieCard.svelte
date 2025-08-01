<script lang="ts">
	import type { Movie } from '$lib/types/movie';
	import { getPosterUrl } from '$lib/services/tmdb';

	export let movie: Movie;
	export let showRating = true;
	export let showYear = true;
	export let size: 'small' | 'medium' | 'large' = 'medium';

	$: posterUrl = getPosterUrl(movie.poster_path, size === 'small' ? 'w185' : 'w500');
	$: releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : '';
	$: rating = movie.vote_average.toFixed(1);

	$: cardClasses = {
		'group relative overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl': true,
		'h-64 w-40': size === 'small',
		'h-80 w-56': size === 'medium',
		'h-96 w-72': size === 'large'
	};

	$: imageClasses = {
		'h-full w-full object-cover transition-transform duration-300 group-hover:scale-110': true
	};
</script>

<div class={Object.entries(cardClasses).map(([k, v]) => v ? k : '').filter(Boolean).join(' ')}>
	<img
		src={posterUrl}
		alt={movie.title}
		class={Object.entries(imageClasses).map(([k, v]) => v ? k : '').filter(Boolean).join(' ')}
		loading="lazy"
	/>
	
	<!-- Overlay with movie info -->
	<div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
		<div class="absolute bottom-0 left-0 right-0 p-4 text-white">
			<h3 class="font-bold text-lg mb-1 line-clamp-2">{movie.title}</h3>
			
			{#if showYear && releaseYear}
				<p class="text-sm text-gray-300 mb-2">{releaseYear}</p>
			{/if}
			
			{#if showRating}
				<div class="flex items-center gap-2 mb-2">
					<div class="flex items-center">
						<svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
							<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
						</svg>
						<span class="text-sm font-medium">{rating}</span>
					</div>
					<span class="text-xs text-gray-400">({movie.vote_count} votes)</span>
				</div>
			{/if}
			
			{#if movie.overview}
				<p class="text-xs text-gray-300 line-clamp-3">{movie.overview}</p>
			{/if}
		</div>
	</div>
</div>