<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	// Import theme store to ensure it's initialized
	import '$lib/stores/theme';
	import Header from '../components/header/header.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/png" href="/favicon.ico" />
	<link href="https://fonts.cdnfonts.com/css/pokemon-solid" rel="stylesheet" />
</svelte:head>

<ParaglideJS {i18n}>
	<div class="min-h-screen transition-colors duration-300" style="background-color: var(--bg-main); color: var(--text-primary);">
		<Header />
		<main>
			{@render children()}
		</main>
	</div>
</ParaglideJS>