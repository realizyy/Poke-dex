<script lang="ts">
	export let title: string;
	import { toggleTheme } from '../../stores/theme';
</script>

<header class="flex items-center justify-between mb-6">
	<div class="flex items-center">
		<img src="/favicon.ico" alt="Pokéball" class="h-8 w-8" />
		<h1 class="mx-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
	</div>
	<button class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600" on:click={toggleTheme} aria-label="Toggle Theme">
		<span class="group inline-flex shrink-0 justify-center items-center size-9">
			<svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
				<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
			</svg>
		</span>
	</button>
</header>