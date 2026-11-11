<script lang="ts">
	import CardImage from '../../../components/tcg/CardImage.svelte';
	import { onMount } from 'svelte';
	import { Layers } from '#lib/icons';
	import { collectionStore } from '#lib/stores/collection.svelte';
	import { toastStore } from '#lib/stores/toast-store.svelte';
	import { summarize, type CollectionEntry } from '#lib/utils/collection';

	onMount(() => collectionStore.load());

	type Tab = 'owned' | 'wishlist';
	let tab = $state<Tab>('owned');

	const summary = $derived(summarize(collectionStore.entries));
	const shown = $derived(
		Object.values(collectionStore.entries)
			.filter((e) => (tab === 'owned' ? e.owned > 0 : e.wishlisted))
			.sort((a, b) => a.setId.localeCompare(b.setId) || a.name.localeCompare(b.name))
	);
	const groups = $derived.by(() => {
		const bySet = new Map<string, CollectionEntry[]>();
		for (const entry of shown) bySet.set(entry.setId, [...(bySet.get(entry.setId) ?? []), entry]);
		return [...bySet.entries()].map(([setId, entries]) => ({ setId, entries }));
	});

	function downloadExport() {
		const blob = new Blob([collectionStore.exportJson()], { type: 'application/json' });
		const url = URL.createObjectURL(blob);
		const link = document.createElement('a');
		link.href = url;
		link.download = 'tcg-collection.json';
		link.click();
		URL.revokeObjectURL(url);
	}

	async function importFile(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		input.value = '';
		if (!file) return;
		try {
			const count = collectionStore.importJson(await file.text());
			toastStore.success('Collection imported', `${count} cards loaded from ${file.name}.`);
		} catch {
			toastStore.error('Import failed', 'That file is not a collection exported from this app.');
		}
	}
</script>

<svelte:head>
	<title>My Card Collection – Pokémon TCG – Pokédex</title>
	<meta name="description" content="Track the Pokémon TCG cards you own and want." />
	<meta name="robots" content="noindex" />
</svelte:head>

<section
	class="border-b"
	style="border-color: var(--border-color); background-color: var(--bg-main);"
>
	<div class="mx-auto max-w-5xl px-6 py-8">
		<nav class="mb-2 flex items-center gap-3 text-sm" style="color: var(--text-muted);">
			<a href="/tcg" class="hover:underline">TCG</a>
			<span>/</span>
			<span class="font-semibold" style="color: var(--text-main);">My collection</span>
		</nav>
		<h1 class="font-extrabold" style="font-size: var(--text-2xl); color: var(--text-main);">
			My collection
		</h1>
		<dl class="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
			{#each [['Unique cards', summary.uniqueCards], ['Total copies', summary.totalCopies], ['Wishlist', summary.wishlisted], ['Sets', summary.sets]] as [label, value] (label)}
				<div
					class="rounded-2xl p-4"
					style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
				>
					<dt class="text-xs font-bold tracking-wider uppercase" style="color: var(--text-muted);">
						{label}
					</dt>
					<dd class="text-2xl font-extrabold tabular-nums" style="color: var(--text-main);">
						{value}
					</dd>
				</div>
			{/each}
		</dl>
	</div>
</section>

<section style="background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-8">
		<div class="mb-6 flex flex-wrap items-center justify-between gap-3">
			<div class="flex gap-2" role="group" aria-label="Collection view">
				{#each [['owned', 'Owned'], ['wishlist', 'Wishlist']] as [id, label] (id)}
					<button
						onclick={() => (tab = id as Tab)}
						aria-pressed={tab === id}
						class="rounded-full px-4 py-1.5 text-sm font-semibold"
						style={tab === id
							? 'background: var(--brand-red); color: white;'
							: 'background: var(--bg-secondary); color: var(--text-main); border: 1px solid var(--border-color);'}
					>
						{label}
					</button>
				{/each}
			</div>
			<div class="flex gap-2">
				<button
					onclick={downloadExport}
					disabled={summary.uniqueCards + summary.wishlisted === 0}
					class="rounded-full px-4 py-1.5 text-sm font-semibold disabled:opacity-40"
					style="background: var(--bg-secondary); color: var(--text-main); border: 1px solid var(--border-color);"
				>
					Export
				</button>
				<label
					class="cursor-pointer rounded-full px-4 py-1.5 text-sm font-semibold"
					style="background: var(--bg-secondary); color: var(--text-main); border: 1px solid var(--border-color);"
				>
					Import
					<input type="file" accept="application/json" class="sr-only" onchange={importFile} />
				</label>
			</div>
		</div>

		{#if groups.length === 0}
			<div
				class="flex flex-col items-center justify-center py-20"
				style="color: var(--text-muted);"
			>
				<Layers size={48} class="mb-4 opacity-30" />
				<p class="text-lg font-semibold">
					{tab === 'owned' ? 'You have not added any cards yet.' : 'Your wishlist is empty.'}
				</p>
				<a href="/tcg/cards" class="mt-3 text-sm hover:underline" style="color: var(--brand-red);">
					Search cards
				</a>
			</div>
		{:else}
			{#each groups as group (group.setId)}
				<h2
					class="mt-6 mb-3 text-xs font-bold tracking-widest uppercase first:mt-0"
					style="color: var(--text-muted);"
				>
					<a href="/tcg/sets/{group.setId}" class="hover:underline">{group.setId}</a>
					· {group.entries.length} card{group.entries.length !== 1 ? 's' : ''}
				</h2>
				<ul class="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
					{#each group.entries as entry (entry.id)}
						<li
							class="relative flex flex-col items-center gap-2 rounded-xl p-2"
							style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
						>
							<a href="/tcg/cards/{entry.id}" class="w-full" title={entry.name}>
								<CardImage
									image={entry.image}
									alt={entry.name}
									class="w-full rounded-lg object-contain"
								/>
								<p
									class="mt-2 truncate text-center text-xs font-semibold"
									style="color: var(--text-main);"
								>
									{entry.name}
								</p>
							</a>
							{#if tab === 'owned'}
								<span
									class="rounded-full px-2 py-0.5 text-xs font-bold"
									style="background: var(--bg-main); color: var(--text-main);"
								>
									×{entry.owned}
								</span>
							{:else}
								<button
									onclick={() => collectionStore.toggleWishlist(entry)}
									class="text-xs font-semibold hover:underline"
									style="color: var(--brand-red);"
									aria-label="Remove {entry.name} from the wishlist"
								>
									Remove
								</button>
							{/if}
						</li>
					{/each}
				</ul>
			{/each}
		{/if}
	</div>
</section>
