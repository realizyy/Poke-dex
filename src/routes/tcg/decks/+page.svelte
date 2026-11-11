<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { Layers } from '#lib/icons';
	import { deckStore } from '#lib/stores/decks.svelte';
	import { DECK_SIZE, deckSize, validateDeck } from '#lib/utils/deck';

	onMount(() => deckStore.load());

	let name = $state('');

	function createDeck(event: SubmitEvent) {
		event.preventDefault();
		const deck = deckStore.create(name);
		name = '';
		goto(`/tcg/decks/${deck.id}`);
	}
</script>

<svelte:head>
	<title>Deck Builder – Pokémon TCG – Pokédex</title>
	<meta name="description" content="Build and check 60 card Pokémon TCG decks." />
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
			<span class="font-semibold" style="color: var(--text-main);">Deck builder</span>
		</nav>
		<h1 class="font-extrabold" style="font-size: var(--text-2xl); color: var(--text-main);">
			Deck builder
		</h1>
		<form onsubmit={createDeck} class="mt-5 flex flex-wrap gap-3">
			<label class="sr-only" for="new-deck-name">Deck name</label>
			<input
				id="new-deck-name"
				bind:value={name}
				placeholder="Deck name"
				class="min-w-64 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
				style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
			/>
			<button type="submit" class="btn-brand rounded-xl px-6 py-2.5 text-sm font-semibold">
				New deck
			</button>
		</form>
	</div>
</section>

<section style="background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-8">
		{#if !deckStore.loaded}
			<p class="text-sm" style="color: var(--text-muted);">Loading your decks…</p>
		{:else if deckStore.list.length === 0}
			<div
				class="flex flex-col items-center justify-center py-20"
				style="color: var(--text-muted);"
			>
				<Layers size={48} class="mb-4 opacity-30" />
				<p class="text-lg font-semibold">You have no decks yet.</p>
				<p class="mt-1 text-sm">Name a deck above to start building.</p>
			</div>
		{:else}
			<ul class="grid gap-4 sm:grid-cols-2">
				{#each deckStore.list as deck (deck.id)}
					{@const validation = validateDeck(deck)}
					<li
						class="rounded-2xl p-5"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
					>
						<a
							href="/tcg/decks/{deck.id}"
							class="text-lg font-bold hover:underline"
							style="color: var(--text-main);"
						>
							{deck.name}
						</a>
						<p class="mt-1 text-sm capitalize" style="color: var(--text-secondary);">
							{deck.format} · {deckSize(deck)} / {DECK_SIZE} cards
						</p>
						<p
							class="mt-2 text-xs font-bold tracking-wider uppercase"
							style="color: {validation.valid ? '#15803d' : '#b91c1c'};"
						>
							{validation.valid ? 'Legal' : `${validation.problems.length} to fix`}
						</p>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</section>
