<script lang="ts">
	import { page } from '$app/state';

	const notFound = $derived(page.status === 404);
	const title = $derived(notFound ? 'Page not found' : 'Something went wrong');
</script>

<svelte:head>
	<title>{page.status} {title} – Pokédex</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div
	class="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 text-center"
>
	<p class="text-primary text-sm font-semibold tracking-widest uppercase">{page.status}</p>
	<h1 class="theme-text mt-2 text-3xl font-bold">{title}</h1>
	<p class="theme-text-secondary mt-3">
		{page.error?.message ?? 'An unexpected error occurred.'}
	</p>
	<div class="mt-8 flex gap-3">
		<a href="/" class="btn btn-primary">Back to home</a>
		<a href="/search" class="btn btn-ghost">Search Pokémon</a>
	</div>
</div>
