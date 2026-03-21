<script lang="ts">
	import { goto } from '$app/navigation';
	import type { PageData } from './$types';
	import { ChevronLeft } from '$lib/icons';
	import TypeBadge from '../../../components/ui/TypeBadge.svelte';
	import { getTypeColor } from '$lib/utils/pokemon-utils';

	let { data }: { data: PageData } = $props();

	const move = $derived(data.move);

	const displayName = $derived(
		move.name
			.split('-')
			.map((w: string) => w.charAt(0).toUpperCase() + w.slice(1))
			.join(' ')
	);

	const heroColor = $derived(getTypeColor(move.type.name));

	const englishEffect = $derived(
		move.effect_entries.find((e) => e.language.name === 'en')
	);

	const latestFlavorText = $derived(
		move.flavor_text_entries
			.filter((ft) => ft.language.name === 'en')
			.at(-1)?.flavor_text.replace(/\f/g, ' ') ?? ''
	);

	const DAMAGE_CLASS_META: Record<string, { label: string; color: string; emoji: string }> = {
		physical: { label: 'Physical', color: '#f97316', emoji: '⚔️' },
		special:  { label: 'Special',  color: '#3b82f6', emoji: '✨' },
		status:   { label: 'Status',   color: '#6b7280', emoji: '💫' }
	};

	const damageClass = $derived(
		DAMAGE_CLASS_META[move.damage_class.name] ?? { label: move.damage_class.name, color: '#6b7280', emoji: '•' }
	);

	// Expand "learned by" list
	let showAllLearners = $state(false);
	const learnersVisible = $derived(
		showAllLearners ? move.learned_by_pokemon : move.learned_by_pokemon.slice(0, 20)
	);

	function handleBack() {
		if (window.history.length > 1) history.back();
		else goto('/search');
	}

	function formatStat(val: number | null): string {
		return val === null ? '—' : String(val);
	}

	// Replace {chance} in effect text with actual value
	const effectText = $derived(
		englishEffect
			? englishEffect.effect.replace(/\{chance\}/g, String(move.effect_chance ?? ''))
			: ''
	);
	const shortEffect = $derived(
		englishEffect
			? englishEffect.short_effect.replace(/\{chance\}/g, String(move.effect_chance ?? ''))
			: ''
	);
</script>

<svelte:head>
	<title>{displayName} — Move · Pokédex</title>
	<meta name="description" content={shortEffect || `${displayName} move details`} />
</svelte:head>

<!-- Hero -->
<div class="relative overflow-hidden" style="background-color: {heroColor};">
	<!-- Pokéball decorative rings — clipped to right half to prevent arc bleeding onto left -->
	<div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
		<div class="absolute -right-16 -top-16 h-80 w-80 rounded-full border-[30px]" style="border-color: rgba(255,255,255,0.1);"></div>
		<div class="absolute -right-2 top-12 h-48 w-48 rounded-full border-[18px]" style="border-color: rgba(255,255,255,0.05);"></div>
	</div>

	<div class="relative mx-auto max-w-4xl px-5 pt-6 pb-10 sm:px-8 lg:px-12">
		<button
			onclick={handleBack}
			class="mb-5 flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
		>
			<ChevronLeft size={18} />
			Back
		</button>

		<div class="flex flex-wrap items-end justify-between gap-4">
			<div>
				<!-- Type + category badges -->
				<div class="mb-3 flex flex-wrap items-center gap-2">
					<TypeBadge type={move.type.name} size="md" />
					<span
						class="rounded-full px-3 py-1 text-sm font-semibold"
						style="background-color: {damageClass.color}; color: white;"
					>
						{damageClass.emoji} {damageClass.label}
					</span>
				</div>
				<h1 class="text-3xl font-black text-white sm:text-4xl">{displayName}</h1>
				{#if shortEffect}
					<p class="mt-2 max-w-xl text-sm leading-relaxed text-white/80">{shortEffect}</p>
				{/if}
			</div>
		</div>
	</div>
</div>

<!-- Body -->
<div class="mx-auto max-w-4xl px-5 py-8 sm:px-8 lg:px-12">

	<!-- Stat grid -->
	<div class="mb-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
		{#each [
			{ label: 'Power',    value: formatStat(move.power),    icon: '💥' },
			{ label: 'Accuracy', value: move.accuracy === null ? '—' : `${move.accuracy}%`, icon: '🎯' },
			{ label: 'PP',       value: String(move.pp),           icon: '🔵' },
			{ label: 'Priority', value: move.priority > 0 ? `+${move.priority}` : String(move.priority), icon: '⚡' }
		] as stat}
			<div
				class="rounded-2xl p-4 text-center"
				style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
			>
				<p class="mb-1 text-xl">{stat.icon}</p>
				<p class="text-2xl font-black theme-text">{stat.value}</p>
				<p class="mt-0.5 text-xs font-semibold uppercase tracking-wider" style="color: var(--text-muted);">{stat.label}</p>
			</div>
		{/each}
	</div>

	<!-- Effect description -->
	{#if effectText}
		<div
			class="mb-6 rounded-2xl p-5"
			style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
		>
			<p class="mb-2 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Effect</p>
			<p class="text-sm leading-relaxed theme-text">{effectText}</p>
		</div>
	{/if}

	<!-- Flavor text -->
	{#if latestFlavorText}
		<div
			class="mb-8 rounded-2xl p-5"
			style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
		>
			<p class="mb-2 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Game Description</p>
			<p class="text-sm italic leading-relaxed" style="color: var(--text-secondary);">{latestFlavorText}</p>
		</div>
	{/if}

	<!-- Meta info (ailment, crit, drain etc.) -->
	{#if move.meta}
		{@const meta = move.meta}
		<div
			class="mb-8 rounded-2xl p-5"
			style="background-color: var(--bg-secondary); border: 1px solid var(--border-color);"
		>
			<p class="mb-3 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">Battle Details</p>
			<div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
				{#if meta.ailment.name !== 'none'}
					<div>
						<p class="text-xs capitalize" style="color: var(--text-muted);">Ailment</p>
						<p class="font-semibold capitalize theme-text">{meta.ailment.name.replace(/-/g, ' ')}</p>
					</div>
				{/if}
				{#if meta.drain !== 0}
					<div>
						<p class="text-xs" style="color: var(--text-muted);">{meta.drain > 0 ? 'Drain' : 'Recoil'}</p>
						<p class="font-semibold theme-text">{Math.abs(meta.drain)}%</p>
					</div>
				{/if}
				{#if meta.healing !== 0}
					<div>
						<p class="text-xs" style="color: var(--text-muted);">Healing</p>
						<p class="font-semibold theme-text">{meta.healing}%</p>
					</div>
				{/if}
				{#if meta.crit_rate > 0}
					<div>
						<p class="text-xs" style="color: var(--text-muted);">Crit Rate</p>
						<p class="font-semibold theme-text">+{meta.crit_rate}</p>
					</div>
				{/if}
				{#if meta.flinch_chance > 0}
					<div>
						<p class="text-xs" style="color: var(--text-muted);">Flinch Chance</p>
						<p class="font-semibold theme-text">{meta.flinch_chance}%</p>
					</div>
				{/if}
				{#if meta.ailment_chance > 0}
					<div>
						<p class="text-xs capitalize" style="color: var(--text-muted);">Ailment Chance</p>
						<p class="font-semibold theme-text">{meta.ailment_chance}%</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<!-- Learned by -->
	{#if move.learned_by_pokemon.length > 0}
		<div>
			<p class="mb-4 text-xs font-bold uppercase tracking-wider" style="color: var(--text-muted);">
				Learned by {move.learned_by_pokemon.length} Pokémon
			</p>
			<div class="flex flex-wrap gap-2">
				{#each learnersVisible as learner}
					<button
						onclick={() => goto(`/pokemon/${learner.name}`)}
						class="rounded-full px-3 py-1.5 text-sm font-medium capitalize transition-all hover:-translate-y-px hover:shadow-md"
						style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-main);"
					>
						{learner.name.replace(/-/g, ' ')}
					</button>
				{/each}
			</div>
			{#if move.learned_by_pokemon.length > 20}
				<button
					onclick={() => (showAllLearners = !showAllLearners)}
					class="mt-4 rounded-xl px-4 py-2 text-sm font-medium transition-colors"
					style="background-color: var(--bg-secondary); border: 1px solid var(--border-color); color: var(--text-secondary);"
				>
					{showAllLearners
						? 'Show less ↑'
						: `Show all ${move.learned_by_pokemon.length} Pokémon ↓`}
				</button>
			{/if}
		</div>
	{/if}

</div>
