<script lang="ts">
	import type { PageData } from './$types';
	import type { Machine } from '$lib/types';
	import { MachineService } from '$lib/services/move-service';
	import { Disc, Search, X } from '$lib/icons';

	let { data }: { data: PageData } = $props();

	let extraMachines: Machine[] = $state([]);
	let searchQuery = $state('');
	let selectedVersion = $state('');
	let loadingMore = $state(false);

	const total = $derived(data.total);
	const machines = $derived([...data.machines, ...extraMachines]);

	const uniqueVersions = $derived(
		[...new Set(machines.map((m) => m.version_group.name))].sort()
	);

	const filtered = $derived(
		machines.filter((m) => {
			const matchesVersion = !selectedVersion || m.version_group.name === selectedVersion;
			const moveName = m.move.name.replace(/-/g, ' ').toLowerCase();
			const machineName = m.item.name.toLowerCase();
			const query = searchQuery.trim().toLowerCase();
			const matchesQuery =
				!query || moveName.includes(query) || machineName.includes(query);
			return matchesVersion && matchesQuery;
		})
	);

	function machineLabel(machine: Machine): string {
		return machine.item.name.toUpperCase().replace(/-/g, '');
	}

	async function loadMore() {
		if (loadingMore) return;
		loadingMore = true;
		try {
			const more = await MachineService.fetchMachineBatch(machines.length, 100);
			extraMachines = [...extraMachines, ...more];
		} finally {
			loadingMore = false;
		}
	}
</script>

<svelte:head>
	<title>TM / HM Browser — Pokédex</title>
	<meta name="description" content="Browse all Technical Machines, Hidden Machines, and Technical Records across every Pokémon game." />
</svelte:head>

<!-- Hero -->
<div class="relative overflow-hidden border-b" style="background-color: var(--bg-secondary); border-color: var(--border-color);">
	<!-- Pokéball decorative rings — clipped to right half to prevent arc bleeding onto left -->
	<div class="pointer-events-none absolute inset-y-0 right-0 w-1/2 overflow-hidden">
		<div class="absolute -right-16 -top-16 h-80 w-80 rounded-full border-[30px]" style="border-color: #f59e0b1A;"></div>
		<div class="absolute -right-2 top-12 h-48 w-48 rounded-full border-[18px]" style="border-color: #f59e0b0D;"></div>
	</div>

	<div class="relative mx-auto max-w-7xl px-5 py-8 sm:px-8 lg:px-12">
		<div class="flex items-center gap-3">
			<div class="flex h-12 w-12 items-center justify-center rounded-2xl" style="background-color: #f59e0b20;">
				<Disc size={24} style="color: #f59e0b;" />
			</div>
			<div>
				<h1 class="text-2xl font-bold leading-tight theme-text sm:text-3xl">TM / HM Browser</h1>
				<p class="mt-0.5 text-sm" style="color: var(--text-secondary);">
					{total.toLocaleString()} machines across all generations
				</p>
			</div>
		</div>
	</div>
</div>

<!-- Filters -->
<div class="sticky top-0 z-20 border-b" style="background-color: var(--bg-main); border-color: var(--border-color);">
	<div class="mx-auto max-w-7xl px-5 py-3 sm:px-8 lg:px-12">
		<div class="flex flex-wrap gap-2">
			<!-- Search -->
			<div class="relative min-w-[200px] flex-1">
				<Search size={15} class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2" style="color: var(--text-muted);" />
				<input
					type="search"
					placeholder="Search move or machine…"
					bind:value={searchQuery}
					class="w-full rounded-xl border py-2 pl-9 pr-4 text-sm outline-none transition-shadow focus:ring-2"
					style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
				/>
				{#if searchQuery}
					<button
						onclick={() => (searchQuery = '')}
						class="absolute right-3 top-1/2 -translate-y-1/2"
						style="color: var(--text-muted);"
					>
						<X size={13} />
					</button>
				{/if}
			</div>

			<!-- Version group filter -->
			<select
				bind:value={selectedVersion}
				class="rounded-xl border px-3 py-2 text-sm outline-none"
				style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-main);"
			>
				<option value="">All versions</option>
				{#each uniqueVersions as v}
					<option value={v}>{v.replace(/-/g, ' ')}</option>
				{/each}
			</select>
		</div>
	</div>
</div>

<!-- Table -->
<div class="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-12">
	<p class="mb-4 text-xs" style="color: var(--text-muted);">
		Showing {filtered.length.toLocaleString()} of {machines.length.toLocaleString()} loaded · {total.toLocaleString()} total
	</p>

	{#if filtered.length === 0}
		<div class="flex flex-col items-center justify-center py-24 text-center">
			<div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style="background-color: var(--bg-secondary);">
				<Disc size={32} style="color: var(--text-muted);" />
			</div>
			<p class="font-semibold theme-text">No machines found</p>
			<p class="mt-1 text-sm" style="color: var(--text-secondary);">Try adjusting your search or version filter</p>
		</div>
	{:else}
		<div class="overflow-x-auto rounded-2xl border" style="border-color: var(--border-color);">
			<table class="w-full border-collapse text-sm">
				<thead>
					<tr class="border-b text-left text-xs font-semibold uppercase tracking-wider" style="background-color: var(--bg-secondary); border-color: var(--border-color); color: var(--text-muted);">
						<th class="px-4 py-3">Machine</th>
						<th class="px-4 py-3">Move</th>
						<th class="px-4 py-3">Version Group</th>
					</tr>
				</thead>
				<tbody>
					{#each filtered as machine (machine.item.name + '-' + machine.version_group.name)}
						<tr
							class="border-b transition-colors duration-100 hover:bg-[var(--bg-secondary)]"
							style="border-color: var(--border-color);"
						>
							<td class="px-4 py-3">
								<span
									class="inline-block rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums"
									style="background-color: #f59e0b20; color: #f59e0b;"
								>
									{machineLabel(machine)}
								</span>
							</td>
							<td class="px-4 py-3">
								<a
									href="/moves/{machine.move.name}"
									class="font-medium capitalize transition-colors duration-100 hover:underline"
									style="color: var(--color-primary);"
								>
									{machine.move.name.replace(/-/g, ' ')}
								</a>
							</td>
							<td class="px-4 py-3 capitalize" style="color: var(--text-secondary);">
								{machine.version_group.name.replace(/-/g, ' ')}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}

	<!-- Load more -->
	{#if machines.length < total && !searchQuery && !selectedVersion}
		<div class="mt-8 text-center">
			<button
				onclick={loadMore}
				disabled={loadingMore}
				class="rounded-xl px-8 py-3 text-sm font-semibold text-white transition-opacity disabled:opacity-50"
				style="background-color: #f59e0b;"
			>
				{loadingMore ? 'Loading…' : `Load more · ${(total - machines.length).toLocaleString()} remaining`}
			</button>
		</div>
	{/if}
</div>
