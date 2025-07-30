<script lang="ts">
	import type { Pokemon } from '$lib/types';
	import { getTypeColor, formatStatName, getStatTotal } from '$lib/utils/pokemon-utils';
	
	export let pokemon: Pokemon;
	export let showStats = false;
	export let showAddToTeam = false;
	export let compact = false;
	export let onClick: (() => void) | undefined = undefined;
	
	function handleClick() {
		if (onClick) {
			onClick();
		}
	}
	
	function getStatColor(value: number): string {
		if (value >= 120) return 'text-green-600';
		if (value >= 90) return 'text-blue-600';
		if (value >= 60) return 'text-yellow-600';
		return 'text-red-600';
	}
</script>

{#if onClick}
<div 
	class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-200 dark:border-gray-700 {compact ? 'p-3' : 'p-4'} cursor-pointer"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
>
	<!-- Pokemon Image and Basic Info -->
	<div class="flex {compact ? 'gap-2' : 'gap-4'} items-start">
		<div class="flex-shrink-0">
			<img
				src={pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
				alt={pokemon.name}
				class="{compact ? 'w-16 h-16' : 'w-20 h-20'} object-contain"
				loading="lazy"
			/>
		</div>
		
		<div class="flex-1 min-w-0">
			<div class="flex items-center justify-between mb-1">
				<h3 class="font-bold text-lg text-gray-900 dark:text-white capitalize truncate">
					{pokemon.name}
				</h3>
				<span class="text-sm text-gray-500 dark:text-gray-400">
					#{pokemon.id.toString().padStart(3, '0')}
				</span>
			</div>
			
			<!-- Types -->
			<div class="flex gap-1 mb-2 flex-wrap">
				{#each pokemon.types as type}
					<span
						class="px-2 py-1 rounded-full text-xs font-semibold text-white"
						style="background-color: {getTypeColor(type.type.name)}"
					>
						{type.type.name}
					</span>
				{/each}
			</div>
			
			<!-- Stats Total (if not compact) -->
			{#if !compact}
				<div class="text-sm text-gray-600 dark:text-gray-400">
					Base Stats Total: <span class="font-semibold {getStatColor(getStatTotal(pokemon))}">{getStatTotal(pokemon)}</span>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Detailed Stats -->
	{#if showStats && !compact}
		<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
			<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Base Stats</h4>
			<div class="grid grid-cols-2 gap-2 text-xs">
				{#each pokemon.stats as stat}
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-400">
							{formatStatName(stat.stat.name)}:
						</span>
						<span class="font-semibold {getStatColor(stat.base_stat)}">
							{stat.base_stat}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Add to Team Button -->
	{#if showAddToTeam}
		<div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
			<slot name="add-to-team" />
		</div>
	{/if}
</div>
{:else}
<div 
	class="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 border border-gray-200 dark:border-gray-700 {compact ? 'p-3' : 'p-4'}"
	role="article"
>
	<!-- Pokemon Image and Basic Info -->
	<div class="flex {compact ? 'gap-2' : 'gap-4'} items-start">
		<div class="flex-shrink-0">
			<img
				src={pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
				alt={pokemon.name}
				class="{compact ? 'w-16 h-16' : 'w-20 h-20'} object-contain"
				loading="lazy"
			/>
		</div>
		
		<div class="flex-1 min-w-0">
			<div class="flex items-center justify-between mb-1">
				<h3 class="font-bold text-lg text-gray-900 dark:text-white capitalize truncate">
					{pokemon.name}
				</h3>
				<span class="text-sm text-gray-500 dark:text-gray-400">
					#{pokemon.id.toString().padStart(3, '0')}
				</span>
			</div>
			
			<!-- Types -->
			<div class="flex gap-1 mb-2 flex-wrap">
				{#each pokemon.types as type}
					<span
						class="px-2 py-1 rounded-full text-xs font-semibold text-white"
						style="background-color: {getTypeColor(type.type.name)}"
					>
						{type.type.name}
					</span>
				{/each}
			</div>
			
			<!-- Stats Total (if not compact) -->
			{#if !compact}
				<div class="text-sm text-gray-600 dark:text-gray-400">
					Base Stats Total: <span class="font-semibold {getStatColor(getStatTotal(pokemon))}">{getStatTotal(pokemon)}</span>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Detailed Stats -->
	{#if showStats && !compact}
		<div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
			<h4 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Base Stats</h4>
			<div class="grid grid-cols-2 gap-2 text-xs">
				{#each pokemon.stats as stat}
					<div class="flex justify-between">
						<span class="text-gray-600 dark:text-gray-400">
							{formatStatName(stat.stat.name)}:
						</span>
						<span class="font-semibold {getStatColor(stat.base_stat)}">
							{stat.base_stat}
						</span>
					</div>
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Add to Team Button -->
	{#if showAddToTeam}
		<div class="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
			<slot name="add-to-team" />
		</div>
	{/if}
</div>
{/if}
