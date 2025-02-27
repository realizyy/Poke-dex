<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import { theme } from '../stores/theme';
	import { onMount } from 'svelte';

	let { children } = $props();

	onMount(() => {
		const currentTheme = localStorage.getItem('theme') || 'light';
		theme.set(currentTheme);
		document.documentElement.classList.toggle('dark', currentTheme === 'dark');
	});
</script>

<svelte:head>
	<title>Pokédex</title>
	<meta name="viewport" content="width=device-width, initial-scale=1" />
	<link rel="icon" type="image/png" href="/favicon.ico" />
</svelte:head>

<ParaglideJS {i18n}>
	<div class="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8 lg:p-12">
		{@render children()}
	</div>
</ParaglideJS>