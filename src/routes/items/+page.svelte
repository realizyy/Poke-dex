<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import type { Item } from '$lib/types';
	import { ItemService } from '$lib/services/item-service';
	import ItemCard from '../../components/ui/ItemCard.svelte';
	import { Package, Search, X, SlidersHorizontal } from '$lib/icons';

	let { data }: { data: PageData } = $props();

	// reactive state — no $state(data.xxx) warnings
	let extraItems: Item[] = $state([]);
	let extraOffset = $state(0);
	let categoryOverride = $state<{ items: Item[]; total: number } | null>(null);

	let searchQuery = $state('');
	let selectedPocket = $state('');
	let selectedCategory = $state('');
	let loadingMore = $state(false);
	let loadingCategory = $state(false);
	let mobileSidebarOpen = $state(false);

	const PAGE_SIZE = 60;

	const baseItems = $derived(
		categoryOverride ? categoryOverride.items : [...data.initialItems, ...extraItems]
	);
	const total = $derived(categoryOverride ? categoryOverride.total : data.total);
	const offset = $derived(
		categoryOverride
			? categoryOverride.items.length
			: data.initialItems.length + extraOffset
	);
	const hasMore = $derived(!categoryOverride && offset < data.total);

	const visibleItems = $derived(
		searchQuery.trim()
			? baseItems.filter((i) =>
					i.name.replace(/-/g, ' ').toLowerCase().includes(searchQuery.toLowerCase())
				)
			: baseItems
	);

	const POCKET_META: Record<string, { label: string; emoji: string; color: string }> = {
		pokeballs:    { label: 'Poké Balls',  emoji: '🔴', color: '#ef4444' },
		medicine:     { label: 'Medicine',    emoji: '💊', color: '#22c55e' },
		'hold-items': { label: 'Hold Items',  emoji: '🛡️', color: '#8b5cf6' },
		machines:     { label: 'Machines',    emoji: '💿', color: '#f59e0b' },
		misc:         { label: 'Misc',        emoji: '🎁', color: '#6b7280' },
		mail:         { label: 'Mail',        emoji: '✉️', color: '#64748b' },
		battle:       { label: 'Battle',      emoji: '⚔️', color: '#dc2626' },
		key:          { label: 'Key Items',   emoji: '🗝️', color: '#3b82f6' }
	};

	function pocketMeta(name: string) {
		return POCKET_META[name] ?? {
			label: name.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
			emoji: '',
			color: '#6b7280'
		};
	}

	async function selectCategory(pocketName: string, categoryName: string) {
		if (selectedCategory === categoryName) return;
		selectedPocket = pocketName;
		selectedCategory = categoryName;
		mobileSidebarOpen = false;
		searchQuery = '';
		loadingCategory = true;
		try {
			const fetched = await ItemService.fetchItemsByCategory(categoryName);
			categoryOverride = { items: fetched, total: fetched.length };
		} finally {
			loadingCategory = false;
		}
	}

	function clearCategory() {
		categoryOverride = null;
		extraItems = [];
		extraOffset = 0;
		selectedPocket = '';
		selectedCategory = '';
		searchQuery = '';
	}

	async function loadMore() {
		if (loadingMore || !hasMore) return;
		loadingMore = true;
		try {
			const result = await ItemService.fetchAllItems(offset, PAGE_SIZE);
			extraItems = [...extraItems, ...result.items];
			extraOffset += result.items.length;
		} finally {
			loadingMore = false;
		}
	}
</script>

<svelte:head>
	<title>Item Encyclopedia — Pokédex</title>
	<meta name="description" content="Browse all Pokémon items: medicines, hold items, Poké Balls, TMs, key items and more." />
</svelte:head>

<!-- Hero -->
<div class="relative overflow-hidden border-b" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
	<!-- Pokéball decorative rings — clipped to right half to prevent arc bleeding onto left -->
	<div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
		<div class="absolute -right-16 -top-16 h-80 w-80 rounded-full border-[30px]" style="border-color: #7c3aed1A;"></div>
		<div class="absolute -right-2 top-12 h-48 w-48 rounded-full border-[18px]" style="border-color: #7c3aed0D;"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
		<div class="flex items-start gap-4">
			<div>
				<h1 class="text-2xl font-bold leading-tight theme-text sm:text-3xl">Item Encyclopedia</h1>
				<p class="mt-0.5 text-sm" style="color: var(--text-secondary);">
					{data.total.toLocaleString()} items across {data.pockets.length} pockets
				</p>
			</div>
		</div>

		<div class="mt-6 flex flex-wrap gap-3">
			<button
				onclick={() => goto('/items/berries')}
				class="flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 hover:opacity-90 hover:shadow-md sm:max-w-sm"
				style="background: linear-gradient(135deg, #15803d, #22c55e); color: white;"
			>
				<span class="text-3xl leading-none">🍒</span>
				<div>
					<p class="font-bold">Berry Encyclopedia</p>
					<p class="text-xs" style="color: rgba(255,255,255,0.75);">All 64 berries · flavors, types and growth stats</p>
				</div>
			</button>

			<button
				onclick={() => goto('/items/machines')}
				class="flex items-center gap-4 rounded-2xl p-4 text-left transition-all duration-200 hover:opacity-90 hover:shadow-md sm:max-w-sm"
				style="background: linear-gradient(135deg, #b45309, #f59e0b); color: white;"
			>
				<span class="text-3xl leading-none">💿</span>
				<div>
					<p class="font-bold">TM / HM Browser</p>
					<p class="text-xs" style="color: rgba(255,255,255,0.75);">All machines · moves, versions and more</p>
				</div>
			</button>
		</div>
	</div>
</div>

<!-- Main content -->
<div class="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
	<div class="flex gap-8">

		<!-- Sidebar -->
		<aside class="hidden w-52 shrink-0 lg:block">
			<div class="sticky top-20 space-y-5">
				<button
					onclick={clearCategory}
					class="flex w-full items-center gap-2 rounded-xl border px-3 py-2 text-sm font-semibold transition-all duration-150"
					style={!selectedPocket
						? 'background-color: #7c3aed15; color: #7c3aed; border-color: #7c3aed40;'
						: 'color: var(--text-secondary); border-color: transparent; background: transparent;'}
				>
					<span>📦</span>
					<span>All Items</span>
					{#if !selectedPocket}
						<span class="ml-auto text-xs opacity-60">{data.total.toLocaleString()}</span>
					{/if}
				</button>

				{#each data.pockets as pocket}
					{#if pocket.name !== 'berries'}
						{@const meta = pocketMeta(pocket.name)}
						<div>
							<div class="flex items-center gap-1.5 px-3 py-1">
								<span class="text-sm leading-none">{meta.emoji}</span>
								<p class="text-xs font-bold uppercase tracking-wider" style="color: {meta.color};">
									{meta.label}
								</p>
							</div>
							<div class="space-y-0.5">
								{#each pocket.categories as cat}
									<button
										onclick={() => selectCategory(pocket.name, cat.name)}
										class="w-full rounded-lg px-3 py-1.5 text-left text-xs font-medium capitalize transition-all duration-150 hover:bg-[var(--bg-tertiary)]"
										style={selectedCategory === cat.name
											? `background-color: ${meta.color}15; color: ${meta.color}; font-weight: 600;`
											: 'color: var(--text-secondary);'}
									>
										{cat.name.replace(/-/g, ' ')}
									</button>
								{/each}
							</div>
						</div>
					{/if}
				{/each}
			</div>
		</aside>

		<!-- Content area -->
		<div class="min-w-0 flex-1">

			<!-- Search bar + mobile filter toggle -->
			<div class="mb-5 flex gap-2">
				<div class="relative flex-1">
					<Search size={16} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style="color: var(--text-muted);" />
					<input
						type="search"
						placeholder="Search items"
						bind:value={searchQuery}
						class="w-full rounded-xl border py-2.5 pl-9 pr-4 text-sm outline-none transition-shadow focus:ring-2"
						style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
					/>
					{#if searchQuery}
						<button
							onclick={() => (searchQuery = '')}
							class="absolute right-3 top-1/2 -translate-y-1/2"
							style="color: var(--text-muted);"
						>
							<X size={14} />
						</button>
					{/if}
				</div>

				<button
					class="flex items-center gap-2 rounded-xl border px-3 py-2 text-sm font-medium lg:hidden"
					style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-secondary);"
					onclick={() => (mobileSidebarOpen = !mobileSidebarOpen)}
				>
					<SlidersHorizontal size={16} />
					Filter
				</button>

				{#if selectedCategory}
					<button
						onclick={clearCategory}
						class="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-semibold text-white"
						style="background-color: var(--color-primary);"
					>
						<X size={12} /> Clear
					</button>
				{/if}
			</div>

			<!-- Mobile category drawer -->
			{#if mobileSidebarOpen}
				<div
					class="mb-5 rounded-2xl p-4 lg:hidden"
					style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
				>
					<button
						onclick={clearCategory}
						class="mb-3 flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold theme-text"
						style="background-color: var(--bg-tertiary);"
					>
						<span>📦</span> All Items
					</button>
					{#each data.pockets as pocket}
						{#if pocket.name !== 'berries'}
							{@const meta = pocketMeta(pocket.name)}
							<p
								class="mb-1 mt-3 flex items-center gap-1.5 px-3 text-xs font-bold uppercase tracking-wider"
								style="color: {meta.color};"
							>
								<span>{meta.emoji}</span> {meta.label}
							</p>
							{#each pocket.categories as cat}
								<button
									onclick={() => selectCategory(pocket.name, cat.name)}
									class="block w-full rounded-lg px-3 py-1.5 text-left text-sm capitalize hover:bg-[var(--bg-tertiary)]"
									style={selectedCategory === cat.name
										? `color: ${meta.color}; font-weight: 600;`
										: 'color: var(--text-secondary);'}
								>
									{cat.name.replace(/-/g, ' ')}
								</button>
							{/each}
						{/if}
					{/each}
				</div>
			{/if}

			<!-- Result count label -->
			{#if selectedCategory}
				<div class="mb-4 flex items-center gap-2 text-xs">
					<span style="color: var(--text-muted);">Showing:</span>
					<span
						class="rounded-full px-3 py-0.5 font-semibold capitalize"
						style="background-color: var(--bg-tertiary); color: var(--text-main);"
					>
						{selectedCategory.replace(/-/g, ' ')}
					</span>
					<span style="color: var(--text-muted);">· {visibleItems.length} items</span>
				</div>
			{:else if searchQuery}
				<p class="mb-4 text-xs" style="color: var(--text-muted);">
					{visibleItems.length} result{visibleItems.length !== 1 ? 's' : ''} for "<strong class="theme-text">{searchQuery}</strong>"
				</p>
			{:else}
				<p class="mb-4 text-xs" style="color: var(--text-muted);">
					Showing {visibleItems.length.toLocaleString()} of {total.toLocaleString()} items
				</p>
			{/if}

			<!-- Grid / empty states -->
			{#if loadingCategory}
				<div class="flex items-center justify-center py-24">
					<div
						class="h-8 w-8 animate-spin rounded-full border-2"
						style="border-color: var(--border-color); border-top-color: var(--color-primary);"
					></div>
				</div>
			{:else if visibleItems.length === 0}
				<div class="flex flex-col items-center justify-center py-24 text-center">
					<div
						class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
						style="background-color: var(--bg-secondary);"
					>
						<Package size={32} style="color: var(--text-muted);" />
					</div>
					<p class="font-semibold theme-text">No items found</p>
					<p class="mt-1 text-sm" style="color: var(--text-secondary);">Try a different search or category</p>
				</div>
			{:else}
				<div class="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
					{#each visibleItems as item (item.id)}
						<ItemCard {item} onclick={() => goto(`/items/${item.name}`)} />
					{/each}
				</div>
			{/if}

			<!-- Load more -->
			{#if hasMore && !searchQuery && !loadingCategory}
				<div class="mt-10 text-center">
					<button
						onclick={loadMore}
						disabled={loadingMore}
						class="rounded-xl px-8 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
						style="background-color: var(--color-primary);"
					>
						{loadingMore ? 'Loading…' : `Load more · ${(total - offset).toLocaleString()} remaining`}
					</button>
				</div>
			{/if}

		</div>
	</div>
</div>

