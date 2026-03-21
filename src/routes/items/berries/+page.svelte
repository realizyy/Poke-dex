<script lang="ts">
import { goto } from '$app/navigation';
import type { PageData } from './$types';
import BerryCard from '../../../components/ui/BerryCard.svelte';

let { data }: { data: PageData } = $props();

const FLAVOR_TABS = ['all', 'spicy', 'dry', 'sweet', 'bitter', 'sour'] as const;
const CONTEST_TYPE: Record<string, string> = {
	spicy: 'Cool',
	dry: 'Beauty',
	sweet: 'Cute',
	bitter: 'Smart',
	sour: 'Tough'
};
type FlavorTab = (typeof FLAVOR_TABS)[number];

let activeTab: FlavorTab = $state('all');

const filtered = $derived(
activeTab === 'all'
? data.berries
: data.berries.filter((b) =>
(b.flavors.find((f) => f.flavor.name === activeTab)?.potency ?? 0) > 0
)
);

const TAB_COLORS: Record<FlavorTab, string> = {
all:    '#6b7280',
spicy:  '#ef4444',
dry:    '#38bdf8',
sweet:  '#f472b6',
bitter: '#84cc16',
sour:   '#eab308'
};

// Count per flavor for tab badges
function flavorCount(f: FlavorTab): number {
if (f === 'all') return data.berries.length;
return data.berries.filter((b) => (b.flavors.find((fl) => fl.flavor.name === f)?.potency ?? 0) > 0).length;
}
</script>

<svelte:head>
<title>Berry Encyclopedia  Pokedex</title>
<meta name="description" content="Browse all 64 Pokemon berries with flavor profiles, Natural Gift types, and growth stats." />
</svelte:head>

<!--  Page Header  -->
<div class="border-b" style="background-color: var(--bg-secondary); border-color: #16a34a40;">
<div class="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-16">
<button
onclick={() => goto('/items')}
class="mb-5 flex items-center gap-1.5 text-sm font-medium transition-opacity hover:opacity-70"
style="color: #16a34a;"
>
← Back to Items
</button>
<div class="flex items-center gap-4">
<div
class="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl"
style="background-color: #16a34a20; border: 2px solid #16a34a30;"
>
🍒
</div>
<div>
<h1 class="text-2xl font-black theme-text sm:text-3xl">Berry Encyclopedia</h1>
<p class="mt-0.5 text-sm" style="color: var(--text-secondary);">
{data.berries.length} berries · flavor profiles, Natural Gift types &amp; growth stats
</p>
</div>
</div>
</div>
</div>
<!--  Flavor filter tabs  -->
<div class="sticky top-0 z-20 border-b" style="background-color: var(--bg-main); border-color: var(--border-color);">
<div class="mx-auto max-w-6xl px-5 sm:px-8 lg:px-16">
<div class="flex gap-1.5 overflow-x-auto py-3 scrollbar-none">
{#each FLAVOR_TABS as tab}
{@const count = flavorCount(tab)}
<button
onclick={() => (activeTab = tab)}
class="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-semibold capitalize transition-all duration-150"
style={activeTab === tab
? `background-color: ${TAB_COLORS[tab]}; color: white;`
: `background-color: var(--bg-secondary); color: var(--text-secondary);`}
>
{tab === 'all' ? 'All' : tab}
{#if tab !== 'all' && CONTEST_TYPE[tab]}
					<span class="ml-0.5 text-[10px] font-normal opacity-70">· {CONTEST_TYPE[tab]}</span>
				{/if}
<span
class="rounded-full px-1.5 py-0.5 text-xs tabular-nums"
style={activeTab === tab
? 'background-color: rgba(255,255,255,0.25); color: white;'
: 'background-color: var(--bg-tertiary); color: var(--text-muted);'}
>{count}</span>
</button>
{/each}
</div>
</div>
</div>

<!--  Grid  -->
<div class="mx-auto max-w-6xl px-5 py-8 sm:px-8 lg:px-16">
{#if filtered.length === 0}
<div class="flex flex-col items-center justify-center py-24 text-center">
<span class="mb-4 text-5xl"></span>
<p class="text-lg font-semibold theme-text">No {activeTab} berries</p>
<p class="mt-1 text-sm" style="color: var(--text-secondary);">
None of the {data.berries.length} berries have a strong {activeTab} flavor
</p>
</div>
{:else}
<p class="mb-5 text-xs" style="color: var(--text-muted);">
{filtered.length} {activeTab === 'all' ? '' : activeTab + ' '}
berr{filtered.length === 1 ? 'y' : 'ies'}
</p>
<div class="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
{#each filtered as berry (berry.id)}
<BerryCard
{berry}
onclick={() => goto(`/items/${berry.item.name}`)}
/>
{/each}
</div>
{/if}
</div>
