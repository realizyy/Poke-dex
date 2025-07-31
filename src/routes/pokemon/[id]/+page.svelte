<script lang="ts">
	import type { ColorType } from '$lib/types';

	export let data;
	let { pokemon } = data;
	let activeTab = 'About';

	function getTypeColor(type: string): string {
		const colors: ColorType = {
			grass: 'bg-emerald-400',
			fire: 'bg-red-400',
			water: 'bg-blue-400',
			electric: 'bg-yellow-400',
			normal: 'bg-gray-400'
		};
		return colors[type] || 'bg-gray-400';
	}

	const tabs = ['About', 'Base Stats', 'Evolution', 'Moves'];
</script>

{#if !pokemon}
	<div class="flex h-screen items-center justify-center">
		<div class="h-8 w-8 animate-spin rounded-full border-b-2 border-gray-900"></div>
	</div>
{:else}
	<div class="min-h-screen {getTypeColor(pokemon.types[0].type.name)} rounded-t-3xl">
		<!-- Header -->
		<div class="p-4">
			<div class="flex items-center justify-between text-white">
				<div class="flex items-center gap-4">
					<a href="/" class="p-2" aria-label="Back">
						<svg
							xmlns="http://www.w3.org/2000/svg"
							class="h-6 w-6"
							fill="none"
							viewBox="0 0 24 24"
							stroke="currentColor"
						>
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</a>
					<h1 class="text-2xl font-bold capitalize">{pokemon.name}</h1>
				</div>
				<span>#{pokemon.id.toString().padStart(3, '0')}</span>
			</div>
		</div>

		<!-- Pokemon Image -->
		<div class="relative flex h-60 justify-center">
			<img
				src={pokemon.sprites.other['official-artwork'].front_default || '/placeholder.svg'}
				alt={pokemon.name}
				class="absolute -bottom-20 h-60"
			/>
		</div>

		<!-- Details Card -->
		<div class="mt-16 min-h-[60vh] rounded-t-3xl bg-white p-6">
			<!-- Tabs -->
			<div class="mb-6 flex justify-between">
				{#each tabs as tab}
					<button
						class="px-4 py-2 font-medium text-gray-600 {activeTab === tab
							? 'border-b-2 border-black text-black'
							: ''}"
						on:click={() => (activeTab = tab)}
					>
						{tab}
					</button>
				{/each}
			</div>

			<!-- Tab Content -->
			{#if activeTab === 'About'}
				<div class="space-y-4">
					<div class="grid grid-cols-2 gap-4">
						<div class="text-gray-600">Species</div>
						<div>Unknown</div>
						<div class="text-gray-600">Height</div>
						<div>{(pokemon.height * 0.1).toFixed(1)}m</div>
						<div class="text-gray-600">Weight</div>
						<div>{(pokemon.weight * 0.1).toFixed(1)}kg</div>
						<div class="text-gray-600">Abilities</div>
						<div class="capitalize">
							{pokemon.abilities.map((a: any) => a.ability.name).join(', ')}
						</div>
					</div>
				</div>
			{:else if activeTab === 'Base Stats'}
				<div class="space-y-4">
					{#each pokemon.stats as stat}
						<div class="grid grid-cols-[100px,1fr] items-center gap-4">
							<div class="text-gray-600 capitalize">
								{stat.stat.name.replace('-', ' ')}
							</div>
							<div class="flex items-center gap-2">
								<div class="w-8 text-right">{stat.base_stat}</div>
								<div class="h-2 flex-1 rounded-full bg-gray-200">
									<div
										class="h-full rounded-full bg-emerald-400"
										style="width: {(stat.base_stat / 255) * 100}%"
									></div>
								</div>
							</div>
						</div>
					{/each}
				</div>
			{:else}
				<div class="text-center text-gray-600">Coming soon...</div>
			{/if}
		</div>
	</div>
{/if}
