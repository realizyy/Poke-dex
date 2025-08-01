<script lang="ts">
	import type { MovieRecommendation } from '$lib/types/movie';
	import { getPosterUrl } from '$lib/services/tmdb';

	export let recommendation: MovieRecommendation;
	export let showScore = true;

	$: posterUrl = getPosterUrl(recommendation.movie.poster_path);
	$: releaseYear = recommendation.movie.release_date ? new Date(recommendation.movie.release_date).getFullYear() : '';
	$: rating = recommendation.movie.vote_average.toFixed(1);
	$: scorePercentage = Math.min((recommendation.score / 50) * 100, 100);
</script>

<div class="group relative overflow-hidden rounded-lg bg-gray-800 shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl">
	<img
		src={posterUrl}
		alt={recommendation.movie.title}
		class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
		loading="lazy"
	/>
	
	<!-- Overlay with movie info -->
	<div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
		<div class="absolute bottom-0 left-0 right-0 p-4 text-white">
			{#if showScore}
				<div class="mb-3">
					<div class="flex items-center justify-between mb-1">
						<span class="text-sm font-medium text-yellow-400">Match Score</span>
						<span class="text-sm font-bold">{recommendation.score}%</span>
					</div>
					<div class="w-full bg-gray-700 rounded-full h-2">
						<div 
							class="bg-gradient-to-r from-yellow-400 to-yellow-600 h-2 rounded-full transition-all duration-300"
							style="width: {scorePercentage}%"
						></div>
					</div>
				</div>
			{/if}
			
			<h3 class="font-bold text-lg mb-1 line-clamp-2">{recommendation.movie.title}</h3>
			
			{#if releaseYear}
				<p class="text-sm text-gray-300 mb-2">{releaseYear}</p>
			{/if}
			
			<div class="flex items-center gap-2 mb-2">
				<div class="flex items-center">
					<svg class="w-4 h-4 text-yellow-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
					</svg>
					<span class="text-sm font-medium">{rating}</span>
				</div>
				<span class="text-xs text-gray-400">({recommendation.movie.vote_count} votes)</span>
			</div>
			
			{#if recommendation.reason}
				<div class="mb-2">
					<p class="text-xs text-blue-300 font-medium">Why recommended:</p>
					<p class="text-xs text-gray-300 line-clamp-2">{recommendation.reason}</p>
				</div>
			{/if}
			
			{#if recommendation.movie.overview}
				<p class="text-xs text-gray-300 line-clamp-3">{recommendation.movie.overview}</p>
			{/if}
		</div>
	</div>
</div>