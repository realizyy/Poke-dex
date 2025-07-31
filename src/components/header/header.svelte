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

<header
	class="theme-border sticky top-0 z-50 shadow-sm backdrop-blur-xl"
	style="background-color: var(--bg-main); border-color: var(--border-color); opacity: 0.9;"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between">
			<!-- Logo and Title -->
			<div class="flex items-center space-x-3">
				<button
					onclick={() => goto('/')}
					class="group flex items-center space-x-3 transition-all duration-200 hover:scale-105"
				>
					<div class="relative">
						<div
							class="border-color: var(--border-color) flex h-10 w-10 items-center justify-center rounded-xl border-1 bg-gradient-to-br from-red-500 to-red-600 shadow-lg transition-shadow group-hover:shadow-xl"
						>
							<span class="text-xl font-bold text-white">P</span>
						</div>
						<div
							class="absolute -top-1 -right-1 h-4 w-4 rounded-full border-2 border-color: var(--border-color) bg-gradient-to-br from-yellow-400 to-yellow-500"
						></div>
					</div>
					<h1 class="theme-text text-2xl font-bold">Pokédex</h1>
				</button>
			</div>

			<!-- Navigation -->
			<nav class="hidden items-center space-x-1 md:flex">
				{#each navItems as item}
					<a
						href={item.href}
						class="group relative flex items-center space-x-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200"
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
							<div
								class="absolute bottom-0 left-1/2 h-1 w-1 -translate-x-1/2 transform rounded-full bg-blue-600"
							></div>
						{/if}
					</a>
				{/each}
			</nav>

			<!-- Theme Toggle and Mobile Menu -->
			<div class="flex items-center space-x-3">
				<ThemeToggle />

				<!-- Mobile Menu Button -->
				<button
					class="theme-bg-secondary theme-text-secondary flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-gray-200 md:hidden"
					style="background-color: var(--bg-secondary); color: var(--text-secondary);"
					aria-label="Open menu"
				>
					<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M4 6h16M4 12h16M4 18h16"
						></path>
					</svg>
				</button>
			</div>
		</div>

		<!-- Mobile Navigation -->
		<div class="theme-border mt-2 pt-4 pb-4 md:hidden" style="border-color: var(--border-color);">
			<nav class="grid grid-cols-2 gap-2">
				{#each navItems as item}
					<a
						href={item.href}
						class="flex items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
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
