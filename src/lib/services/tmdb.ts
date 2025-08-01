import axios from 'axios';
import { setupCache } from 'axios-cache-interceptor';
import type {
	Movie,
	MovieDetails,
	MovieResponse,
	SearchResponse,
	DiscoverResponse,
	MovieRecommendation,
	UserPreferences
} from '$lib/types/movie';

const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

// You'll need to get your own API key from https://www.themoviedb.org/settings/api
const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || 'your-api-key-here';

const api = setupCache(axios.create({
	baseURL: TMDB_BASE_URL,
	params: {
		api_key: TMDB_API_KEY,
		language: 'en-US'
	}
}));

export class TMDBService {
	// Get popular movies
	static async getPopularMovies(page: number = 1): Promise<MovieResponse> {
		const response = await api.get<MovieResponse>('/movie/popular', {
			params: { page }
		});
		return response.data;
	}

	// Get top rated movies
	static async getTopRatedMovies(page: number = 1): Promise<MovieResponse> {
		const response = await api.get<MovieResponse>('/movie/top_rated', {
			params: { page }
		});
		return response.data;
	}

	// Get now playing movies
	static async getNowPlayingMovies(page: number = 1): Promise<MovieResponse> {
		const response = await api.get<MovieResponse>('/movie/now_playing', {
			params: { page }
		});
		return response.data;
	}

	// Get upcoming movies
	static async getUpcomingMovies(page: number = 1): Promise<MovieResponse> {
		const response = await api.get<MovieResponse>('/movie/upcoming', {
			params: { page }
		});
		return response.data;
	}

	// Get movie details
	static async getMovieDetails(movieId: number): Promise<MovieDetails> {
		const response = await api.get<MovieDetails>(`/movie/${movieId}`, {
			params: {
				append_to_response: 'videos,credits,recommendations,similar'
			}
		});
		return response.data;
	}

	// Search movies
	static async searchMovies(query: string, page: number = 1): Promise<SearchResponse> {
		const response = await api.get<SearchResponse>('/search/movie', {
			params: { query, page }
		});
		return response.data;
	}

	// Discover movies with filters
	static async discoverMovies(params: {
		page?: number;
		sort_by?: string;
		with_genres?: string;
		with_original_language?: string;
		'vote_average.gte'?: number;
		'vote_average.lte'?: number;
		'primary_release_date.gte'?: string;
		'primary_release_date.lte'?: string;
		include_adult?: boolean;
	}): Promise<DiscoverResponse> {
		const response = await api.get<DiscoverResponse>('/discover/movie', {
			params
		});
		return response.data;
	}

	// Get movie recommendations based on a movie
	static async getMovieRecommendations(movieId: number, page: number = 1): Promise<MovieResponse> {
		const response = await api.get<MovieResponse>(`/movie/${movieId}/recommendations`, {
			params: { page }
		});
		return response.data;
	}

	// Get similar movies
	static async getSimilarMovies(movieId: number, page: number = 1): Promise<MovieResponse> {
		const response = await api.get<MovieResponse>(`/movie/${movieId}/similar`, {
			params: { page }
		});
		return response.data;
	}

	// Get genres
	static async getGenres(): Promise<{ genres: Array<{ id: number; name: string }> }> {
		const response = await api.get('/genre/movie/list');
		return response.data;
	}

	// Generate personalized recommendations based on user preferences
	static async getPersonalizedRecommendations(
		preferences: UserPreferences,
		page: number = 1
	): Promise<MovieRecommendation[]> {
		const discoverParams: any = {
			page,
			sort_by: 'popularity.desc',
			include_adult: preferences.includeAdult,
			'vote_average.gte': preferences.minRating,
			'primary_release_date.gte': `${preferences.yearRange.min}-01-01`,
			'primary_release_date.lte': `${preferences.yearRange.max}-12-31`
		};

		if (preferences.favoriteGenres.length > 0) {
			discoverParams.with_genres = preferences.favoriteGenres.join(',');
		}

		if (preferences.preferredLanguages.length > 0) {
			discoverParams.with_original_language = preferences.preferredLanguages.join('|');
		}

		const response = await this.discoverMovies(discoverParams);
		
		// Calculate recommendation scores based on user preferences
		const recommendations: MovieRecommendation[] = response.results.map(movie => {
			let score = 0;
			const reasons: string[] = [];

			// Score based on genre match
			const genreMatches = movie.genre_ids.filter(id => 
				preferences.favoriteGenres.includes(id)
			).length;
			if (genreMatches > 0) {
				score += genreMatches * 10;
				reasons.push(`Matches ${genreMatches} of your favorite genres`);
			}

			// Score based on rating
			if (movie.vote_average >= preferences.minRating) {
				score += (movie.vote_average - preferences.minRating) * 2;
				reasons.push(`High rating: ${movie.vote_average}/10`);
			}

			// Score based on popularity
			score += Math.min(movie.popularity / 100, 10);
			if (movie.popularity > 50) {
				reasons.push('Popular movie');
			}

			// Score based on release year
			const releaseYear = new Date(movie.release_date).getFullYear();
			if (releaseYear >= preferences.yearRange.min && releaseYear <= preferences.yearRange.max) {
				score += 5;
				reasons.push(`Released in ${releaseYear}`);
			}

			return {
				movie,
				score: Math.round(score),
				reason: reasons.join(', ')
			};
		});

		// Sort by score descending
		return recommendations.sort((a, b) => b.score - a.score);
	}

	// Get trending movies
	static async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<MovieResponse> {
		const response = await api.get<MovieResponse>(`/trending/movie/${timeWindow}`, {
			params: { page }
		});
		return response.data;
	}
}

// Utility functions for image URLs
export const getImageUrl = (path: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string => {
	if (!path) return '/placeholder-movie.jpg';
	return `${TMDB_IMAGE_BASE_URL}/${size}${path}`;
};

export const getPosterUrl = (path: string, size: 'w92' | 'w154' | 'w185' | 'w342' | 'w500' | 'w780' | 'original' = 'w500'): string => {
	return getImageUrl(path, size);
};

export const getBackdropUrl = (path: string, size: 'w300' | 'w780' | 'w1280' | 'original' = 'w1280'): string => {
	return getImageUrl(path, size);
};

export const getProfileUrl = (path: string, size: 'w45' | 'w185' | 'h632' | 'original' = 'w185'): string => {
	return getImageUrl(path, size);
};