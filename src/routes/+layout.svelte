<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	// Import theme store to ensure it's initialized
	import '../stores/theme';

	let { children } = $props();
</script>

<svelte:head>
	<title>Pokédex - Explore the World of Pokémon</title>
	<meta name="description" content="Discover, analyze, and build teams with your favorite Pokémon. Access detailed stats, type coverage, and battle simulations." />
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/png" href="/favicon.ico" />
	<link href="https://fonts.cdnfonts.com/css/pokemon-solid" rel="stylesheet" />
</svelte:head>

<ParaglideJS {i18n}>
	<div class="min-h-screen transition-colors duration-300">
		{@render children()}
	</div>
</ParaglideJS>