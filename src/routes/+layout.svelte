<script lang="ts">
	import '../app.css';
	import { page } from '$app/stores';
	import { onMount } from 'svelte';

	let isMenuOpen = false;

	onMount(() => {
		// Close mobile menu when clicking outside
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as HTMLElement;
			if (!target.closest('.mobile-menu') && !target.closest('.menu-button')) {
				isMenuOpen = false;
			}
		};

		document.addEventListener('click', handleClickOutside);
		return () => document.removeEventListener('click', handleClickOutside);
	});

	$: currentPath = $page.url.pathname;
</script>

<div class="min-h-screen bg-gray-900">
	<!-- Navigation -->
	<nav class="bg-gray-800 border-b border-gray-700 sticky top-0 z-50">
		<div class="container mx-auto px-4">
			<div class="flex justify-between items-center h-16">
				<!-- Logo -->
				<a href="/" class="flex items-center space-x-2">
					<svg class="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
						<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
					</svg>
					<span class="text-xl font-bold text-white">Movie Library</span>
				</a>

				<!-- Desktop Navigation -->
				<div class="hidden md:flex items-center space-x-8">
					<a 
						href="/" 
						class="text-gray-300 hover:text-white transition-colors duration-200 {currentPath === '/' ? 'text-blue-400' : ''}"
					>
						Home
					</a>
					<a 
						href="/search" 
						class="text-gray-300 hover:text-white transition-colors duration-200 {currentPath.startsWith('/search') ? 'text-blue-400' : ''}"
					>
						Search
					</a>
					<a 
						href="/recommendations" 
						class="text-gray-300 hover:text-white transition-colors duration-200 {currentPath.startsWith('/recommendations') ? 'text-blue-400' : ''}"
					>
						Recommendations
					</a>
					<a 
						href="/trending" 
						class="text-gray-300 hover:text-white transition-colors duration-200 {currentPath.startsWith('/trending') ? 'text-blue-400' : ''}"
					>
						Trending
					</a>
					<a 
						href="/popular" 
						class="text-gray-300 hover:text-white transition-colors duration-200 {currentPath.startsWith('/popular') ? 'text-blue-400' : ''}"
					>
						Popular
					</a>
				</div>

				<!-- Mobile menu button -->
				<button
					class="menu-button md:hidden p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
					on:click={() => isMenuOpen = !isMenuOpen}
				>
					<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						{#if isMenuOpen}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
						{:else}
							<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"/>
						{/if}
					</svg>
				</button>
			</div>

			<!-- Mobile Navigation -->
			{#if isMenuOpen}
				<div class="mobile-menu md:hidden">
					<div class="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-700">
						<a 
							href="/" 
							class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 {currentPath === '/' ? 'text-blue-400 bg-gray-700' : ''}"
						>
							Home
						</a>
						<a 
							href="/search" 
							class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 {currentPath.startsWith('/search') ? 'text-blue-400 bg-gray-700' : ''}"
						>
							Search
						</a>
						<a 
							href="/recommendations" 
							class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 {currentPath.startsWith('/recommendations') ? 'text-blue-400 bg-gray-700' : ''}"
						>
							Recommendations
						</a>
						<a 
							href="/trending" 
							class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 {currentPath.startsWith('/trending') ? 'text-blue-400 bg-gray-700' : ''}"
						>
							Trending
						</a>
						<a 
							href="/popular" 
							class="block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-white hover:bg-gray-700 {currentPath.startsWith('/popular') ? 'text-blue-400 bg-gray-700' : ''}"
						>
							Popular
						</a>
					</div>
				</div>
			{/if}
		</div>
	</nav>

	<!-- Main Content -->
	<main>
		<slot />
	</main>

	<!-- Footer -->
	<footer class="bg-gray-800 border-t border-gray-700 mt-16">
		<div class="container mx-auto px-4 py-8">
			<div class="grid md:grid-cols-3 gap-8">
				<div>
					<h3 class="text-lg font-semibold text-white mb-4">Movie Library</h3>
					<p class="text-gray-400 text-sm">
						Discover and explore thousands of movies with personalized recommendations powered by TMDB.
					</p>
				</div>
				
				<div>
					<h3 class="text-lg font-semibold text-white mb-4">Features</h3>
					<ul class="space-y-2 text-sm text-gray-400">
						<li>• Smart movie recommendations</li>
						<li>• Advanced search and filtering</li>
						<li>• Detailed movie information</li>
						<li>• Cast and crew details</li>
					</ul>
				</div>
				
				<div>
					<h3 class="text-lg font-semibold text-white mb-4">Powered by</h3>
					<div class="flex items-center space-x-2">
						<a 
							href="https://www.themoviedb.org/" 
							target="_blank" 
							rel="noopener noreferrer"
							class="text-blue-400 hover:text-blue-300 transition-colors duration-200"
						>
							TMDB API
						</a>
					</div>
					<p class="text-gray-400 text-sm mt-2">
						This product uses the TMDB API but is not endorsed or certified by TMDB.
					</p>
				</div>
			</div>
			
			<div class="border-t border-gray-700 mt-8 pt-8 text-center">
				<p class="text-gray-400 text-sm">
					© 2024 Movie Library. Built with SvelteKit and Tailwind CSS.
				</p>
			</div>
		</div>
	</footer>
</div>