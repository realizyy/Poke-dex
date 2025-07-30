/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class', // Enable class-based dark mode
	theme: {
		extend: {
			colors: {
				// Pokemon type colors
				normal: '#A8A878',
				fire: '#F08030',
				water: '#6890F0',
				electric: '#F8D030',
				grass: '#78C850',
				ice: '#98D8D8',
				fighting: '#C03028',
				poison: '#A040A0',
				ground: '#E0C068',
				flying: '#A890F0',
				psychic: '#F85888',
				bug: '#A8B820',
				rock: '#B8A038',
				ghost: '#705898',
				dragon: '#7038F8',
				dark: '#705848',
				steel: '#B8B8D0',
				fairy: '#EE99AC'
			},
			fontFamily: {
				pokemon: ['Pokemon Solid', 'Fredoka One', 'Cooper Black', 'Arial Black', 'sans-serif']
			}
		}
	},
	plugins: []
};
