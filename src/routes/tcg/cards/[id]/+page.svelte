<script lang="ts">
	import { ChevronLeft, Layers } from '$lib/icons';
	import { TcgService } from '$lib/services/tcg-service';
	import type { TcgCard } from '$lib/types';

	let { data } = $props<{ data: { card: TcgCard } }>();
	const card = $derived(data.card);

	// Energy type → colour mapping (unofficial but widely recognised)
	const typeColors: Record<string, string> = {
		Fire:       '#ef4444',
		Water:      '#3b82f6',
		Grass:      '#22c55e',
		Lightning:  '#eab308',
		Psychic:    '#a855f7',
		Fighting:   '#f97316',
		Darkness:   '#6b7280',
		Metal:      '#9ca3af',
		Dragon:     '#8b5cf6',
		Fairy:      '#ec4899',
		Colorless:  '#d1d5db',
	};

	function typeColor(type: string) {
		return typeColors[type] ?? '#64748b';
	}

	/** Energy icon glyph using simple coloured dot */
	function energyDot(type: string) {
		return typeColors[type] ?? '#64748b';
	}

	const pokemonSearchName = $derived(
		card.evolveFrom
			? card.evolveFrom.toLowerCase()
			: card.name.toLowerCase().split(' ')[0]
	);
</script>

<svelte:head>
	<title>{card.name} – TCG – Pokédex</title>
	<meta name="description" content="{card.name} — {card.rarity ?? 'TCG card'} from {card.set.name}." />
</svelte:head>

<!-- ─── Back breadcrumb ─────────────────────────────────────────────────────── -->
<section class="border-b" style="border-color: var(--border-color); background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-4">
		<nav class="flex items-center gap-2 text-sm" style="color: var(--text-muted);">
			<a href="/tcg" class="hover:underline">TCG</a>
			<span>/</span>
			<a href="/tcg/sets/{card.set.id}" class="hover:underline">{card.set.name}</a>
			<span>/</span>
			<span style="color: var(--text-main);">{card.name}</span>
		</nav>
	</div>
</section>

<!-- ─── Main layout ─────────────────────────────────────────────────────────── -->
<section style="background-color: var(--bg-main);">
	<div class="mx-auto max-w-5xl px-6 py-10">
		<div class="grid grid-cols-1 gap-10 md:grid-cols-[320px_1fr]">

			<!-- Left: Card image + legality + variants -->
			<div class="flex flex-col gap-6">
				<!-- Card image -->
				<div class="relative">
					{#if card.image}
						<img
							src="{TcgService.cardImageUrl(card.image, 'high')}"
							alt="{card.name}"
							class="w-full max-w-xs mx-auto rounded-2xl shadow-2xl"
							loading="eager"
							width="420" height="588"
						/>
					{:else}
						<div class="aspect-[5/7] max-w-xs mx-auto rounded-2xl flex items-center justify-center" style="background: var(--bg-secondary); border: 1px solid var(--border-color);">
							<Layers size={64} class="opacity-20" />
						</div>
					{/if}
				</div>

				<!-- Legality -->
				{#if card.legal}
					<div class="rounded-2xl p-4" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
						<p class="text-xs font-bold uppercase tracking-widest mb-3" style="color: var(--text-muted);">Format Legality</p>
						<div class="flex gap-3">
							<div class="flex items-center gap-2">
								<div class="h-2.5 w-2.5 rounded-full" style="background: {card.legal.standard ? '#22c55e' : '#ef4444'};"></div>
								<span class="text-sm" style="color: var(--text-main);">Standard</span>
							</div>
							<div class="flex items-center gap-2">
								<div class="h-2.5 w-2.5 rounded-full" style="background: {card.legal.expanded ? '#22c55e' : '#ef4444'};"></div>
								<span class="text-sm" style="color: var(--text-main);">Expanded</span>
							</div>
						</div>
					</div>
				{/if}

				<!-- Variants -->
				{#if card.variants}
					<div class="rounded-2xl p-4" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
						<p class="text-xs font-bold uppercase tracking-widest mb-3" style="color: var(--text-muted);">Variants</p>
						<div class="flex flex-wrap gap-2">
							{#if card.variants.normal}
								<span class="rounded-full px-3 py-1 text-xs font-bold" style="background: var(--bg-main); color: var(--text-secondary); border: 1px solid var(--border-color);">Normal</span>
							{/if}
							{#if card.variants.holo}
								<span class="rounded-full px-3 py-1 text-xs font-bold" style="background: linear-gradient(135deg, #f0abfc, #818cf8); color: #fff;">Holo</span>
							{/if}
							{#if card.variants.reverse}
								<span class="rounded-full px-3 py-1 text-xs font-bold" style="background: linear-gradient(135deg, #67e8f9, #a78bfa); color: #fff;">Reverse Holo</span>
							{/if}
							{#if card.variants.firstEdition}
								<span class="rounded-full px-3 py-1 text-xs font-bold" style="background: #f59e0b; color: #fff;">1st Edition</span>
							{/if}
							{#if card.variants.wPromo}
								<span class="rounded-full px-3 py-1 text-xs font-bold" style="background: var(--brand-red); color: #fff;">Promo</span>
							{/if}
						</div>
					</div>
				{/if}
			</div>

			<!-- Right: Info -->
			<div class="flex flex-col gap-6">

				<!-- Name + meta -->
				<div>
					<div class="flex flex-wrap items-center gap-2 mb-2">
						<!-- Types -->
						{#each (card.types ?? []) as type (type)}
							<span class="rounded-full px-3 py-1 text-xs font-bold text-white" style="background: {typeColor(type)};">
								{type}
							</span>
						{/each}
						<!-- Category badge -->
						<span class="rounded-full px-3 py-1 text-xs font-bold" style="background: var(--bg-secondary); color: var(--text-muted); border: 1px solid var(--border-color);">
							{card.category}
						</span>
					</div>

					<h1 class="font-extrabold tracking-tight leading-none" style="font-size: var(--text-3xl); color: var(--text-main);">
						{card.name}
					</h1>

					<div class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm" style="color: var(--text-secondary);">
						{#if card.hp}
							<span><strong style="color: var(--text-main);">{card.hp} HP</strong></span>
						{/if}
						{#if card.stage}
							<span>Stage: <strong style="color: var(--text-main);">{card.stage}</strong></span>
						{/if}
						{#if card.rarity}
							<span>Rarity: <strong style="color: var(--text-main);">{card.rarity}</strong></span>
						{/if}
						{#if card.regulationMark}
							<span>Regulation: <strong style="color: var(--text-main);">{card.regulationMark}</strong></span>
						{/if}
					</div>
				</div>

				<!-- Evolves from -->
				{#if card.evolveFrom}
					<div class="rounded-2xl p-4" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
						<p class="text-xs font-bold uppercase tracking-widest mb-1" style="color: var(--text-muted);">Evolves From</p>
						<a
							href="/pokemon/{card.evolveFrom.toLowerCase()}"
							class="text-base font-semibold hover:underline"
							style="color: var(--brand-red);"
						>
							{card.evolveFrom}
						</a>
					</div>
				{/if}

				<!-- Pokédex description -->
				{#if card.description}
					<blockquote class="rounded-2xl p-4 italic" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary);">
						"{card.description}"
					</blockquote>
				{/if}

				<!-- Attacks -->
				{#if card.attacks && card.attacks.length > 0}
					<div class="rounded-2xl p-5" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
						<p class="text-xs font-bold uppercase tracking-widest mb-4" style="color: var(--text-muted);">Attacks</p>
						<div class="flex flex-col gap-4">
							{#each card.attacks as attack (attack.name)}
								<div class="flex flex-col gap-1.5">
									<!-- Cost + name + damage row -->
									<div class="flex items-center gap-2 flex-wrap">
										<!-- Energy cost dots -->
										<div class="flex gap-1">
											{#each attack.cost as cost (cost)}
												<span
													class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white"
													style="background: {energyDot(cost)};"
													title={cost}
												>
													{cost[0]}
												</span>
											{/each}
										</div>
										<span class="font-bold" style="color: var(--text-main);">{attack.name}</span>
										{#if attack.damage}
											<span class="ml-auto font-extrabold text-lg" style="color: var(--text-main);">{attack.damage}</span>
										{/if}
									</div>
									{#if attack.effect}
										<p class="text-sm leading-relaxed" style="color: var(--text-secondary);">{attack.effect}</p>
									{/if}
								</div>
							{/each}
						</div>
					</div>
				{/if}

				<!-- Weaknesses / Resistances / Retreat -->
				{#if (card.weaknesses?.length || card.resistances?.length || card.retreat != null)}
					<div class="grid grid-cols-3 gap-3">
						<!-- Weaknesses -->
						<div class="rounded-xl p-3 text-center" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
							<p class="text-[10px] font-bold uppercase tracking-widest mb-2" style="color: var(--text-muted);">Weakness</p>
							{#if card.weaknesses?.length}
								{#each card.weaknesses as w (w.type)}
									<div class="flex items-center justify-center gap-1">
										<span class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white" style="background: {energyDot(w.type)};" title={w.type}>{w.type[0]}</span>
										<span class="text-sm font-bold" style="color: var(--text-main);">{w.value}</span>
									</div>
								{/each}
							{:else}
								<span class="text-sm" style="color: var(--text-muted);">—</span>
							{/if}
						</div>

						<!-- Resistances -->
						<div class="rounded-xl p-3 text-center" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
							<p class="text-[10px] font-bold uppercase tracking-widest mb-2" style="color: var(--text-muted);">Resistance</p>
							{#if card.resistances?.length}
								{#each card.resistances as r (r.type)}
									<div class="flex items-center justify-center gap-1">
										<span class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white" style="background: {energyDot(r.type)};" title={r.type}>{r.type[0]}</span>
										<span class="text-sm font-bold" style="color: var(--text-main);">{r.value}</span>
									</div>
								{/each}
							{:else}
								<span class="text-sm" style="color: var(--text-muted);">—</span>
							{/if}
						</div>

						<!-- Retreat cost -->
						<div class="rounded-xl p-3 text-center" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
							<p class="text-[10px] font-bold uppercase tracking-widest mb-2" style="color: var(--text-muted);">Retreat</p>
							{#if card.retreat != null}
								<div class="flex items-center justify-center gap-0.5 flex-wrap">
									{#each { length: card.retreat } as _, i (i)}
										<span class="inline-flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black text-white" style="background: {energyDot('Colorless')};">C</span>
									{/each}
									{#if card.retreat === 0}
										<span class="text-sm font-bold" style="color: var(--text-main);">Free</span>
									{/if}
								</div>
							{:else}
								<span class="text-sm" style="color: var(--text-muted);">—</span>
							{/if}
						</div>
					</div>
				{/if}

				<!-- Set info + illustrator -->
				<div class="rounded-2xl p-4" style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);">
					<p class="text-xs font-bold uppercase tracking-widest mb-3" style="color: var(--text-muted);">Card Info</p>
					<dl class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
						<dt style="color: var(--text-muted);">Set</dt>
						<dd>
							<a href="/tcg/sets/{card.set.id}" class="font-semibold hover:underline" style="color: var(--brand-red);">
								{card.set.name}
							</a>
						</dd>
						<dt style="color: var(--text-muted);">Card #</dt>
						<dd class="font-semibold" style="color: var(--text-main);">{card.localId}</dd>
						{#if card.illustrator}
							<dt style="color: var(--text-muted);">Illustrator</dt>
							<dd class="font-semibold" style="color: var(--text-main);">{card.illustrator}</dd>
						{/if}
					</dl>
				</div>

				<!-- Link to Pokémon page -->
				{#if card.category === 'Pokemon'}
					<a
						href="/pokemon/{card.name.toLowerCase().split(' ')[0]}"
						class="inline-flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-80"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						<img
							src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/{card.name.toLowerCase().split(' ')[0]}.png"
							alt={card.name}
							class="h-8 w-8 object-contain"
							onerror={(e) => { (e.currentTarget as HTMLImageElement).style.display='none'; }}
						/>
						View {card.name.split(' ')[0]} in Pokédex →
					</a>
				{/if}
			</div>
		</div>
	</div>
</section>
