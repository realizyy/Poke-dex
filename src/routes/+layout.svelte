<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import '$lib/fonts.css';
	// Import theme store to ensure it's initialized
	import '$lib/stores/theme';
	// Import cache store to start preloading
	import '$lib/stores/pokemon-cache';
	import Header from '../components/header/header.svelte';
	import CacheStatus from '../components/ui/cache-status.svelte';
	import ToastContainer from '../components/ui/ToastContainer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/png" href="/favicon.ico" />
</svelte:head>

<ParaglideJS {i18n}>
	<div class="min-h-screen transition-colors duration-300" style="background-color: var(--bg-main); color: var(--text-primary);">
		<Header />
		<main>
			{@render children()}
		</main>
		<CacheStatus />
		<ToastContainer />
	</div>
</ParaglideJS>