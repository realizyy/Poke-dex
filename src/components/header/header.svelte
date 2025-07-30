<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ThemeToggle from '../ui/ThemeToggle.svelte';
	
	export let title = 'Pokédx';
	
	const navItems = [
		{ href: '/', label: 'Home', icon: '🏠' },
		{ href: '/search', label: 'Search', icon: '🔍' },
		{ href: '/teams', label: 'Teams', icon: '👥' },
		{ href: '/battle', label: 'Battle', icon: '⚔️' }
	];
	
	$: currentPath = $page.url.pathname;
</script>

<header class="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50 shadow-sm">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo and Title -->
			<div class="flex items-center space-x-3">
				<button
					on:click={() => goto('/')}
					class="flex items-center space-x-3 group transition-all duration-200 hover:scale-105"
				>
					<div class="relative">
						<div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow">
							<span class="text-white text-xl font-bold">P</span>
						</div>
						<div class="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full border-2 border-white dark:border-gray-900"></div>
					</div>
					<h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
						{title}
					</h1>
				</button>
			</div>
			
			<!-- Navigation -->
			<nav class="hidden md:flex items-center space-x-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group
							{currentPath === item.href 
								? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
								: 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800/50'}"
					>
						<span class="text-base transition-transform duration-200 group-hover:scale-110">
							{item.icon}
						</span>
						<span>{item.label}</span>
						
						{#if currentPath === item.href}
							<div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
						{/if}
					</a>
				{/each}
			</nav>
			
			<!-- Theme Toggle and Mobile Menu -->
			<div class="flex items-center space-x-3">
				<ThemeToggle />
				
				<!-- Mobile Menu Button -->
				<button
					class="md:hidden flex items-center justify-center w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
					aria-label="Open menu"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
					</svg>
				</button>
			</div>
		</div>
		
		<!-- Mobile Navigation -->
		<div class="md:hidden pb-4 border-t border-gray-200 dark:border-gray-700 mt-2 pt-4">
			<nav class="grid grid-cols-2 gap-2">
				{#each navItems as item}
					<a
						href={item.href}
						class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
							{currentPath === item.href 
								? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20' 
								: 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800/50'}"
					>
						<span class="text-lg">{item.icon}</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>
		</div>
	</div>
</header>