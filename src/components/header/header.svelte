<script lang="ts">
	export let title: string;
	import { toggleTheme } from '../../stores/theme';
	import { page } from '$app/stores';
	
	$: currentPath = $page.url.pathname;
	
	const navItems = [
		{ href: '/', label: 'Home', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
		{ href: '/search', label: 'Search', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
		{ href: '/teams', label: 'Teams', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
		{ href: '/battle', label: 'Battle', icon: 'M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1' }
	];
</script>

<header class="mb-6">
	<!-- Main Header -->
	<div class="flex items-center justify-between mb-4">
		<div class="flex items-center">
			<img src="/favicon.ico" alt="Pokéball" class="h-8 w-8" />
			<h1 class="mx-2 text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h1>
		</div>
		<button 
			class="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors" 
			on:click={toggleTheme} 
			aria-label="Toggle Theme"
		>
			<span class="group inline-flex shrink-0 justify-center items-center size-9">
				<svg class="shrink-0 size-4" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
				</svg>
			</span>
		</button>
	</div>
	
	<!-- Navigation -->
	<nav class="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
		<div class="flex items-center justify-center p-2">
			{#each navItems as item}
				<a
					href={item.href}
					class="flex flex-col items-center gap-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors {currentPath === item.href 
						? 'bg-blue-500 text-white' 
						: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={item.icon}></path>
					</svg>
					<span class="hidden sm:block">{item.label}</span>
				</a>
			{/each}
		</div>
	</nav>
</header>