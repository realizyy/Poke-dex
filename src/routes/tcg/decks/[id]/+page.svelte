<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';
	import { TcgService } from '#lib/services/tcg-service';
	import { deckStore } from '#lib/stores/decks.svelte';
	import { toastStore } from '#lib/stores/toast-store.svelte';
	import type { TcgCardBrief } from '#lib/types';
	import {
		DECK_FORMATS,
		DECK_SIZE,
		atCopyLimit,
		categoryCounts,
		deckSize,
		decklistText,
		describeProblem,
		toDeckCard,
		validateDeck,
		type DeckCard,
		type DeckFormat
	} from '#lib/utils/deck';

	onMount(() => deckStore.load());

	const deckId = $derived(page.params.id ?? '');
	const deck = $derived(deckStore.get(deckId));
	const validation = $derived(deck ? validateDeck(deck) : null);
	const counts = $derived(deck ? categoryCounts(deck) : null);
	const groups = $derived(
		(['Pokemon', 'Trainer', 'Energy'] as const).map((category) => ({
			category,
			cards: Object.values(deck?.cards ?? {})
				.filter((c) => c.category === category)
				.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id))
		}))
	);

	let query = $state('');
	let results = $state<TcgCardBrief[]>([]);
	let searching = $state(false);
	let searched = $state(false);
	let adding = $state<string | null>(null);

	async function search(event: SubmitEvent) {
		event.preventDefault();
		if (!query.trim()) return;
		searching = true;
		try {
			const { cards } = await TcgService.searchCards({ name: query.trim(), itemsPerPage: 12 });
			results = cards;
		} catch {
			results = [];
			toastStore.error('Search failed', 'The card database is not responding.');
		} finally {
			searching = false;
			searched = true;
		}
	}

	async function addBrief(brief: TcgCardBrief) {
		if (!deck) return;
		adding = brief.id;
		try {
			const card = toDeckCard(await TcgService.fetchCard(brief.id));
			if (atCopyLimit(deck, card)) {
				toastStore.warning('Copy limit', `A deck can hold at most 4 copies of ${card.name}.`);
				return;
			}
			deckStore.adjust(deck.id, card, 1);
		} catch {
			toastStore.error('Could not add card', 'The card database is not responding.');
		} finally {
			adding = null;
		}
	}

	function adjust(card: DeckCard, delta: number) {
		if (!deck) return;
		if (delta > 0 && atCopyLimit(deck, card)) {
			toastStore.warning('Copy limit', `A deck can hold at most 4 copies of ${card.name}.`);
			return;
		}
		deckStore.adjust(deck.id, card, delta);
	}

	async function copyDecklist() {
		if (!deck) return;
		try {
			await navigator.clipboard.writeText(decklistText(deck));
			toastStore.success('Decklist copied', `${deck.name} is on your clipboard.`);
		} catch {
			toastStore.error('Copy failed', 'Your browser blocked clipboard access.');
		}
	}

	function deleteDeck() {
		if (!deck) return;
		deckStore.remove(deck.id);
		goto('/tcg/decks');
	}
</script>

<svelte:head>
	<title>{deck?.name ?? 'Deck'} – Deck Builder – Pokédex</title>
	<meta name="robots" content="noindex" />
</svelte:head>

{#if !deckStore.loaded}
	<div class="mx-auto max-w-5xl px-6 py-16 text-sm" style="color: var(--text-muted);">
		Loading deck…
	</div>
{:else if !deck || !validation || !counts}
	<div class="mx-auto flex max-w-xl flex-col items-center px-6 py-24 text-center">
		<h1 class="text-2xl font-bold" style="color: var(--text-main);">Deck not found</h1>
		<p class="mt-2" style="color: var(--text-secondary);">
			This deck is stored in the browser that created it.
		</p>
		<a href="/tcg/decks" class="btn btn-primary mt-6">Back to decks</a>
	</div>
{:else}
	<section
		class="border-b"
		style="border-color: var(--border-color); background-color: var(--bg-main);"
	>
		<div class="mx-auto max-w-6xl px-6 py-6">
			<nav class="mb-3 flex items-center gap-3 text-sm" style="color: var(--text-muted);">
				<a href="/tcg" class="hover:underline">TCG</a>
				<span>/</span>
				<a href="/tcg/decks" class="hover:underline">Decks</a>
			</nav>
			<div class="flex flex-wrap items-end gap-4">
				<div class="flex flex-col gap-1">
					<label
						for="deck-name"
						class="text-xs font-bold tracking-wider uppercase"
						style="color: var(--text-muted);">Deck name</label
					>
					<input
						id="deck-name"
						value={deck.name}
						onchange={(e) => deckStore.rename(deck.id, e.currentTarget.value)}
						class="rounded-xl px-4 py-2 text-lg font-bold focus:outline-none"
						style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
					/>
				</div>
				<div class="flex flex-col gap-1">
					<label
						for="deck-format"
						class="text-xs font-bold tracking-wider uppercase"
						style="color: var(--text-muted);">Format</label
					>
					<select
						id="deck-format"
						value={deck.format}
						onchange={(e) => deckStore.setFormat(deck.id, e.currentTarget.value as DeckFormat)}
						class="rounded-xl px-4 py-2.5 text-sm focus:outline-none"
						style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						{#each DECK_FORMATS as f (f.id)}
							<option value={f.id}>{f.label}</option>
						{/each}
					</select>
				</div>
				<p
					class="text-3xl font-extrabold tabular-nums"
					style="color: {validation.size === DECK_SIZE ? '#15803d' : 'var(--text-main)'};"
					aria-label="Cards in deck"
				>
					{deckSize(deck)} / {DECK_SIZE}
				</p>
				<div class="ml-auto flex gap-2">
					<button
						onclick={copyDecklist}
						class="rounded-full px-4 py-1.5 text-sm font-semibold"
						style="background: var(--bg-secondary); color: var(--text-main); border: 1px solid var(--border-color);"
					>
						Copy decklist
					</button>
					<button
						onclick={deleteDeck}
						class="rounded-full px-4 py-1.5 text-sm font-semibold"
						style="background: var(--bg-secondary); color: #b91c1c; border: 1px solid var(--border-color);"
					>
						Delete deck
					</button>
				</div>
			</div>
		</div>
	</section>

	<section style="background-color: var(--bg-main);">
		<div class="mx-auto grid max-w-6xl gap-8 px-6 py-8 lg:grid-cols-[1fr_22rem]">
			<div>
				<h2
					class="mb-3 text-xs font-bold tracking-widest uppercase"
					style="color: var(--text-muted);"
				>
					Find cards
				</h2>
				<form onsubmit={search} class="mb-4 flex gap-3">
					<label class="sr-only" for="deck-card-search">Card name</label>
					<input
						id="deck-card-search"
						bind:value={query}
						placeholder="Card name, e.g. Pikachu"
						class="w-full rounded-xl px-4 py-2.5 text-sm focus:outline-none"
						style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
					/>
					<button type="submit" class="btn-brand rounded-xl px-6 py-2.5 text-sm font-semibold">
						Search
					</button>
				</form>

				{#if searching}
					<p class="text-sm" style="color: var(--text-muted);">Searching…</p>
				{:else if searched && results.length === 0}
					<p class="text-sm" style="color: var(--text-muted);">No cards found.</p>
				{:else}
					<ul class="grid grid-cols-3 gap-3 sm:grid-cols-4">
						{#each results as card (card.id)}
							<li
								class="flex flex-col items-center gap-2 rounded-xl p-2"
								style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
							>
								{#if card.image}
									<img
										src={TcgService.cardImageUrl(card.image, 'low')}
										alt={card.name}
										class="w-full rounded-lg object-contain"
										loading="lazy"
										width="200"
										height="280"
									/>
								{/if}
								<p
									class="w-full truncate text-center text-xs font-semibold"
									style="color: var(--text-main);"
								>
									{card.name}
								</p>
								<button
									onclick={() => addBrief(card)}
									disabled={adding === card.id}
									aria-label="Add {card.name} {card.id} to the deck"
									class="btn-brand w-full rounded-lg px-2 py-1 text-xs font-semibold disabled:opacity-50"
								>
									{adding === card.id ? 'Adding…' : 'Add'}
								</button>
							</li>
						{/each}
					</ul>
				{/if}
			</div>

			<aside class="flex flex-col gap-5">
				<div
					class="rounded-2xl p-4"
					style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
					role="status"
				>
					<p class="text-sm font-bold" style="color: var(--text-main);">
						{validation.valid ? `Legal in ${deck.format}` : 'Needs attention'}
					</p>
					{#if validation.valid}
						<p class="mt-1 text-sm" style="color: var(--text-secondary);">
							This deck follows every rule checked here.
						</p>
					{:else}
						<ul class="mt-2 list-disc space-y-1 pl-5 text-sm" style="color: var(--text-secondary);">
							{#each validation.problems as problem (problem.code)}
								<li>{describeProblem(problem)}</li>
							{/each}
						</ul>
					{/if}
					<p class="mt-3 text-xs" style="color: var(--text-muted);">
						Pokémon {counts.Pokemon} · Trainer {counts.Trainer} · Energy {counts.Energy}
					</p>
				</div>

				{#each groups as group (group.category)}
					{#if group.cards.length > 0}
						<div>
							<h2
								class="mb-2 text-xs font-bold tracking-widest uppercase"
								style="color: var(--text-muted);"
							>
								{group.category === 'Pokemon' ? 'Pokémon' : group.category}
								· {counts[group.category]}
							</h2>
							<ul class="space-y-1">
								{#each group.cards as card (card.id)}
									<li
										class="flex items-center justify-between gap-2 rounded-lg px-3 py-1.5 text-sm"
										style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
									>
										<a
											href="/tcg/cards/{card.id}"
											class="truncate hover:underline"
											style="color: var(--text-main);"
										>
											{card.name}
											<span class="text-xs" style="color: var(--text-muted);"
												>{card.setId}-{card.localId}</span
											>
										</a>
										<span class="flex shrink-0 items-center gap-1">
											<button
												onclick={() => adjust(card, -1)}
												aria-label="Remove one {card.name} {card.id}"
												class="h-6 w-6 rounded-full font-bold"
												style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
											>
												−
											</button>
											<span class="w-6 text-center font-bold tabular-nums">{card.count}</span>
											<button
												onclick={() => adjust(card, 1)}
												aria-label="Add one {card.name} {card.id}"
												class="h-6 w-6 rounded-full font-bold"
												style="background: var(--bg-main); border: 1px solid var(--border-color); color: var(--text-main);"
											>
												+
											</button>
										</span>
									</li>
								{/each}
							</ul>
						</div>
					{/if}
				{/each}
			</aside>
		</div>
	</section>
{/if}
