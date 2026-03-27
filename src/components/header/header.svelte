<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { Home, Search, Users, Swords, Package, Menu, X, ArrowLeftRight, Layers } from '$lib/icons';
	import ThemeToggle from '../ui/ThemeToggle.svelte';

	const navItems = [
		{ href: '/',        label: 'Home',    Icon: Home },
		{ href: '/search',  label: 'Search',  Icon: Search },
		{ href: '/teams',   label: 'Teams',   Icon: Users },
		{ href: '/battle',  label: 'Battle',  Icon: Swords },
		{ href: '/items',   label: 'Items',   Icon: Package },
		{ href: '/compare', label: 'Compare', Icon: ArrowLeftRight },
		{ href: '/tcg',     label: 'TCG',     Icon: Layers }
	];

	const currentPath = $derived($page.url.pathname);

	let isMobileMenuOpen = $state(false);

	function toggleMobileMenu() {
		isMobileMenuOpen = !isMobileMenuOpen;
	}

	function closeMobileMenu() {
		isMobileMenuOpen = false;
	}

	function handleNavigation(href: string) {
		closeMobileMenu();
		if (currentPath === '/battle' && href !== '/battle') {
			window.location.href = href;
		} else {
			goto(href);
		}
	}
</script>

<header
	class="sticky top-0 z-50 backdrop-blur-xl"
	style="background-color: color-mix(in oklch, var(--bg-main) 85%, transparent); border-bottom: 1px solid var(--border-color);"
>
	<div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
		<div class="flex h-16 items-center justify-between gap-4">
			<!-- Logo + Brand -->
			<button
				onclick={() => goto('/')}
				class="group flex flex-shrink-0 items-center gap-2.5 transition-all duration-200"
				aria-label="Go to home page"
			>
				<!-- Circular avatar container -->
				<span class="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full shadow-md transition-all duration-200"
					style="background: radial-gradient(circle at 35% 35%, #ef4444, #991b1b); outline: 2px solid color-mix(in oklch, var(--color-primary) 40%, transparent); outline-offset: 1px; group-hover:outline-4;">
					<img
						src="/poke_1.png"
						alt="Pokédex logo"
						class="h-6 w-6 rounded-full object-contain drop-shadow-sm"
						width="40" height="40"
						loading="eager"
						fetchpriority="high"
					/>
				</span>
				<!-- Brand name -->
				<span class="hidden text-base font-bold tracking-tight sm:block"
					style="color: var(--text-main);">
					Pokédex
				</span>
			</button>

			<!-- Navigation: pill container -->
			<nav
				class="hidden items-center gap-1 rounded-2xl p-1 md:flex"
				style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
			>
				{#each navItems as item}
					{@const isActive = currentPath === item.href}
					<button
						onclick={() => handleNavigation(item.href)}
						class="group flex items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-sm font-medium transition-all duration-200"
						style={isActive
							? 'color: var(--color-primary-content); background-color: var(--color-primary);'
							: 'color: var(--text-secondary); background: transparent;'}
						aria-current={isActive ? 'page' : undefined}
					>
						<span class="transition-transform duration-150 group-hover:scale-110">
							<item.Icon size={16} />
						</span>
						<span>{item.label}</span>
					</button>
				{/each}
			</nav>

			<!-- Theme Toggle and Mobile Menu -->
			<div class="flex items-center space-x-3">
				<ThemeToggle />

				<!-- Mobile Menu Button -->
				<button
					onclick={toggleMobileMenu}
					class="theme-bg-secondary theme-text-secondary flex h-10 w-10 items-center justify-center rounded-xl transition-colors hover:bg-gray-200 md:hidden"
					style="background-color: var(--bg-secondary); color: var(--text-secondary);"
					aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
					aria-expanded={isMobileMenuOpen}
				>
					{#if isMobileMenuOpen}
						<X size={20} />
					{:else}
						<Menu size={20} />
					{/if}
				</button>
			</div>
		</div>

		<!-- Mobile Navigation -->
		{#if isMobileMenuOpen}
			<div 
				class="theme-border mt-2 pt-4 pb-4 md:hidden overflow-hidden transition-all duration-300 ease-in-out"
				style="border-color: var(--border-color);"
				role="navigation"
				aria-label="Mobile navigation menu"
			>
				<nav class="grid grid-cols-2 gap-2">
					{#each navItems as item}
						{@const isActive = currentPath === item.href}
						<button
							onclick={() => handleNavigation(item.href)}
							class="flex w-full items-center space-x-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
							style={isActive
								? 'color: var(--brand-red); background-color: var(--bg-tertiary);'
								: 'color: var(--text-secondary);'}
							aria-current={isActive ? 'page' : undefined}
						>
							<span class="flex-shrink-0">
								<item.Icon size={20} />
							</span>
							<span>{item.label}</span>
						</button>
					{/each}
				</nav>
			</div>
		{/if}
	</div>
</header>
