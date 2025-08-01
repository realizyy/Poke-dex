export interface Movie {
	id: number;
	title: string;
	overview: string;
	poster_path: string;
	backdrop_path: string;
	release_date: string;
	vote_average: number;
	vote_count: number;
	popularity: number;
	genre_ids: number[];
	adult: boolean;
	original_language: string;
	original_title: string;
	video: boolean;
}

export interface MovieDetails extends Movie {
	budget: number;
	revenue: number;
	runtime: number;
	status: string;
	genres: Genre[];
	production_companies: ProductionCompany[];
	production_countries: ProductionCountry[];
	spoken_languages: SpokenLanguage[];
	belongs_to_collection: Collection | null;
	homepage: string;
	imdb_id: string;
	external_ids: ExternalIds;
	videos: VideoResponse;
	credits: Credits;
	recommendations: MovieResponse;
	similar: MovieResponse;
}

export interface Genre {
	id: number;
	name: string;
}

export interface ProductionCompany {
	id: number;
	name: string;
	logo_path: string | null;
	origin_country: string;
}

export interface ProductionCountry {
	iso_3166_1: string;
	name: string;
}

export interface SpokenLanguage {
	iso_639_1: string;
	name: string;
}

export interface Collection {
	id: number;
	name: string;
	poster_path: string;
	backdrop_path: string;
}

export interface ExternalIds {
	imdb_id: string;
	facebook_id: string;
	instagram_id: string;
	twitter_id: string;
	youtube_id: string;
}

export interface Video {
	id: string;
	key: string;
	name: string;
	site: string;
	size: number;
	type: string;
	official: boolean;
	published_at: string;
}

export interface VideoResponse {
	results: Video[];
}

export interface Credits {
	cast: CastMember[];
	crew: CrewMember[];
}

export interface CastMember {
	id: number;
	name: string;
	character: string;
	profile_path: string | null;
	order: number;
}

export interface CrewMember {
	id: number;
	name: string;
	job: string;
	department: string;
	profile_path: string | null;
}

export interface MovieResponse {
	page: number;
	results: Movie[];
	total_pages: number;
	total_results: number;
}

export interface SearchResponse extends MovieResponse {}

export interface DiscoverResponse extends MovieResponse {}

export interface RecommendationsResponse extends MovieResponse {}

export interface MovieRecommendation {
	movie: Movie;
	score: number;
	reason: string;
}

export interface UserPreferences {
	favoriteGenres: number[];
	preferredLanguages: string[];
	minRating: number;
	includeAdult: boolean;
	yearRange: {
		min: number;
		max: number;
	};
}