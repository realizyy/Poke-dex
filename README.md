# Movie Library

A modern, responsive movie library application built with SvelteKit and powered by the TMDB API. Discover movies, get personalized recommendations, and explore detailed information about your favorite films.

## Features

### 🎬 Movie Discovery
- **Trending Movies**: See what's popular this week
- **Popular Movies**: Browse the most popular films
- **Now Playing**: Discover movies currently in theaters
- **Top Rated**: Find critically acclaimed films
- **Upcoming**: See what's coming soon

### 🔍 Advanced Search & Filtering
- **Smart Search**: Search movies by title, genre, and more
- **Advanced Filters**: Filter by genre, rating, year range, and language
- **Sort Options**: Sort by popularity, rating, release date, or title
- **Real-time Results**: Instant search results with pagination

### 🧠 Personalized Recommendations
- **Smart Matching**: Get recommendations based on your preferences
- **Customizable Preferences**: Set favorite genres, minimum ratings, and year ranges
- **Scoring System**: Each recommendation comes with a personalized match score
- **Reasoning**: Understand why movies are recommended to you

### 📱 Detailed Movie Information
- **Comprehensive Details**: Cast, crew, ratings, budget, and more
- **Trailers & Videos**: Watch official trailers and clips
- **Similar Movies**: Discover related films
- **Recommendations**: Get personalized suggestions for each movie

### 🎨 Modern UI/UX
- **Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **Dark Theme**: Easy on the eyes with a beautiful dark interface
- **Smooth Animations**: Engaging hover effects and transitions
- **Loading States**: Professional loading indicators and skeleton screens

## Tech Stack

- **Frontend**: SvelteKit 5.0
- **Styling**: Tailwind CSS 4.0
- **API**: TMDB (The Movie Database)
- **HTTP Client**: Axios with caching
- **TypeScript**: Full type safety
- **Build Tool**: Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- TMDB API key (free at [themoviedb.org](https://www.themoviedb.org/settings/api))

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd movie-library
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   VITE_TMDB_API_KEY=your_tmdb_api_key_here
   ```

4. **Get your TMDB API key**
   - Go to [themoviedb.org](https://www.themoviedb.org/settings/api)
   - Sign up for a free account
   - Request an API key
   - Add it to your `.env` file

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

### Building for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── MovieCard.svelte
│   ├── MovieGrid.svelte
│   ├── SearchBar.svelte
│   └── RecommendationCard.svelte
├── lib/
│   ├── services/       # API services
│   │   └── tmdb.ts
│   └── types/          # TypeScript type definitions
│       └── movie.ts
├── routes/             # SvelteKit pages
│   ├── +layout.svelte
│   ├── +page.svelte
│   ├── search/
│   ├── movie/[id]/
│   └── recommendations/
└── app.css            # Global styles
```

## API Integration

This application uses the TMDB API for all movie data. The integration includes:

- **Movie Discovery**: Popular, trending, top-rated, and upcoming movies
- **Search & Filtering**: Advanced search with multiple filter options
- **Movie Details**: Comprehensive information including cast, crew, videos
- **Recommendations**: Similar movies and personalized suggestions
- **Image Handling**: Optimized poster and backdrop images

### API Endpoints Used

- `/movie/popular` - Popular movies
- `/movie/top_rated` - Top rated movies
- `/movie/now_playing` - Currently playing movies
- `/movie/upcoming` - Upcoming movies
- `/trending/movie/week` - Trending movies
- `/discover/movie` - Advanced movie discovery
- `/search/movie` - Movie search
- `/movie/{id}` - Movie details
- `/movie/{id}/recommendations` - Movie recommendations
- `/movie/{id}/similar` - Similar movies
- `/genre/movie/list` - Movie genres

## Features in Detail

### Smart Recommendations

The recommendation system uses a sophisticated scoring algorithm that considers:

- **Genre Matching**: Movies matching your favorite genres get higher scores
- **Rating Requirements**: Films meeting your minimum rating threshold
- **Year Preferences**: Movies from your preferred time period
- **Popularity**: Trending and popular films get bonus points
- **Personalization**: Scores are calculated based on your specific preferences

### Advanced Search

The search functionality includes:

- **Text Search**: Search by movie title
- **Genre Filtering**: Filter by multiple genres
- **Rating Filter**: Set minimum rating requirements
- **Year Range**: Filter by release year
- **Sort Options**: Sort by popularity, rating, date, or title
- **Real-time Results**: Instant search with pagination

### Movie Details

Each movie page provides:

- **Comprehensive Information**: Title, overview, release date, runtime
- **Cast & Crew**: Detailed information about actors and filmmakers
- **Videos & Trailers**: Official trailers and clips
- **Production Details**: Budget, revenue, production companies
- **Similar Movies**: Related film suggestions
- **Personalized Recommendations**: Movies you might like

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- [TMDB](https://www.themoviedb.org/) for providing the comprehensive movie database API
- [SvelteKit](https://kit.svelte.dev/) for the amazing framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS framework

## Support

If you encounter any issues or have questions:

1. Check the [TMDB API documentation](https://developers.themoviedb.org/3)
2. Ensure your API key is correctly set in the `.env` file
3. Check the browser console for any error messages
4. Open an issue on GitHub with detailed information

---

**Note**: This application uses the TMDB API but is not endorsed or certified by TMDB.
