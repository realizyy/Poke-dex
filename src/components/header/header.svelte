<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import ThemeToggle from '../ui/ThemeToggle.svelte';
	
	const navItems = [
		{ 
			href: '/', 
			label: 'Home', 
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path>
			</svg>`
		},
		{ 
			href: '/search', 
			label: 'Search', 
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
			</svg>`
		},
		{ 
			href: '/teams', 
			label: 'Teams', 
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
			</svg>`
		},
		{ 
			href: '/battle', 
			label: 'Battle', 
			icon: `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"></path>
			</svg>`
		}
	];
	
	const currentPath = $derived($page.url.pathname);
</script>

<header class="sticky top-0 z-50 backdrop-blur-xl theme-border shadow-sm" style="background-color: var(--bg-main); border-color: var(--border-color); opacity: 0.9;">
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
		<div class="flex items-center justify-between h-16">
			<!-- Logo and Title -->
			<div class="flex items-center space-x-3">
				<button
					onclick={() => goto('/')}
					class="flex items-center space-x-3 group transition-all duration-200 hover:scale-105"
				>
					<div class="relative">
						<div class="w-10 h-10 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow border-1 border-color: var(--border-color)">
							<span class="text-white text-xl font-bold">P</span>
						</div>
						<div class="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-full border-2 border-white"></div>
					</div>
					<h1 class="text-2xl font-bold theme-text">
						Pokédex
					</h1>
				</button>
			</div>
			
			<!-- Navigation -->
			<nav class="hidden md:flex items-center space-x-1">
				{#each navItems as item}
					<a
						href={item.href}
						class="relative flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 group"
						class:active={currentPath === item.href}
						style={currentPath === item.href 
							? 'color: #3b82f6; background-color: var(--bg-tertiary);' 
							: 'color: var(--text-secondary);'}
					>
						<span class="transition-transform duration-200 group-hover:scale-110">
							{@html item.icon}
						</span>
						<span>{item.label}</span>
						
						{#if currentPath === item.href}
							<div class="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-600 rounded-full"></div>
						{/if}
					</a>
				{/each}
			</nav>
			
			<!-- Theme Toggle and Mobile Menu -->
			<div class="flex items-center space-x-3">
				<ThemeToggle />
				
				<!-- Mobile Menu Button -->
				<button
					class="md:hidden flex items-center justify-center w-10 h-10 rounded-xl theme-bg-secondary theme-text-secondary hover:bg-gray-200 transition-colors"
					style="background-color: var(--bg-secondary); color: var(--text-secondary);"
					aria-label="Open menu"
				>
					<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
					</svg>
				</button>
			</div>
		</div>
		
		<!-- Mobile Navigation -->
		<div class="md:hidden pb-4 theme-border mt-2 pt-4" style="border-color: var(--border-color);">
			<nav class="grid grid-cols-2 gap-2">
				{#each navItems as item}
					<a
						href={item.href}
						class="flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200"
						style={currentPath === item.href 
							? 'color: #3b82f6; background-color: var(--bg-tertiary);' 
							: 'color: var(--text-secondary);'}
					>
						<span class="flex-shrink-0">
							{@html item.icon}
						</span>
						<span>{item.label}</span>
					</a>
				{/each}
			</nav>
		</div>
	</div>
</header>