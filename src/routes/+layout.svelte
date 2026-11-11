<script lang="ts">
	import '../app.css';
	import '#lib/fonts.css';
	// Import theme store to ensure it's initialized
	import '#lib/stores/theme.svelte';
	import { dev } from '$app/env';
	import Header from '../components/header/header.svelte';
	import CacheStatus from '../components/ui/cache-status.svelte';
	import ToastContainer from '../components/ui/ToastContainer.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/png" href="/favicon.ico" />
	<meta name="theme-color" content="#3b82f6" />
	<meta property="og:site_name" content="Pokédex" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<div
	class="min-h-screen transition-colors duration-300"
	style="background-color: var(--bg-main); color: var(--text-primary);"
>
	<Header />
	<main>
		{@render children()}
	</main>
	{#if dev}
		<CacheStatus />
	{/if}
	<ToastContainer />
</div>
