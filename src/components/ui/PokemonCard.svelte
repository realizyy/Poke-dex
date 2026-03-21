<script lang="ts">
	import type { Pokemon } from '$lib/types';
	import { getStatTotal } from '$lib/utils/pokemon-utils';
	import TypeBadge from './TypeBadge.svelte';
	import StatBar from './StatBar.svelte';
	
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

	function getStatTotalColor(value: number): string {
		if (value >= 600) return 'text-green-600';
		if (value >= 450) return 'text-blue-600';
		if (value >= 300) return 'text-yellow-600';
		return 'text-red-600';
	}
</script>

{#if onClick}
<div 
	class="theme-bg-secondary rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 theme-border {compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'} cursor-pointer"
	style="background-color: var(--bg-secondary); border-color: var(--border-color);"
	on:click={handleClick}
	on:keydown={(e) => e.key === 'Enter' && handleClick()}
	role="button"
	tabindex="0"
>
	<!-- Pokemon Image and Basic Info -->
	<div class="flex {compact ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-4'} items-start">
		<div class="flex-shrink-0">
			<img
				src={pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
				alt={pokemon.name}
				class="{compact ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-16 h-16 sm:w-20 sm:h-20'} object-contain"
				width={compact ? 64 : 80}
				height={compact ? 64 : 80}
				loading="lazy"
			/>
		</div>
		
		<div class="flex-1 min-w-0">
			<div class="flex items-center justify-between mb-1">
				<h3 class="font-bold text-sm sm:text-lg theme-text capitalize truncate">
					{pokemon.name}
				</h3>
				<span class="text-xs sm:text-sm theme-text-secondary">
					#{pokemon.id.toString().padStart(3, '0')}
				</span>
			</div>
			
			<!-- Types -->
			<div class="flex gap-1 mb-1.5 sm:mb-2 flex-wrap">
				{#each pokemon.types as type}
					<TypeBadge type={type.type.name} size={compact ? 'sm' : 'md'} />
				{/each}
			</div>
			
			<!-- Stats Total (if not compact) -->
			{#if !compact}
				<div class="text-xs sm:text-sm theme-text-secondary">
					Base Stats Total: <span class="font-semibold {getStatTotalColor(getStatTotal(pokemon))}">{getStatTotal(pokemon)}</span>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Detailed Stats -->
	{#if showStats && !compact}
		<div class="mt-3 sm:mt-4 pt-3 sm:pt-4 theme-border" style="border-top: 1px solid var(--border-color);">
			<h4 class="text-xs sm:text-sm font-semibold theme-text-secondary mb-1.5 sm:mb-2">Base Stats</h4>
			<div class="space-y-1.5">
				{#each pokemon.stats as stat}
					<StatBar name={stat.stat.name} value={stat.base_stat} />
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Add to Team Button -->
	{#if showAddToTeam}
		<div class="mt-2 sm:mt-3 pt-2 sm:pt-3 theme-border" style="border-top: 1px solid var(--border-color);">
			<slot name="add-to-team" />
		</div>
	{/if}
</div>
{:else}
<div 
	class="theme-bg-secondary rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 theme-border {compact ? 'p-2 sm:p-3' : 'p-3 sm:p-4'}"
	style="background-color: var(--bg-secondary); border-color: var(--border-color);"
	role="article"
>
	<!-- Pokemon Image and Basic Info -->
	<div class="flex {compact ? 'gap-1.5 sm:gap-2' : 'gap-2 sm:gap-4'} items-start">
		<div class="flex-shrink-0">
			<img
				src={pokemon.sprites.other['official-artwork'].front_default || '/favicon.png'}
				alt={pokemon.name}
				class="{compact ? 'w-12 h-12 sm:w-16 sm:h-16' : 'w-16 h-16 sm:w-20 sm:h-20'} object-contain"
				width={compact ? 64 : 80}
				height={compact ? 64 : 80}
				loading="lazy"
			/>
		</div>
		
		<div class="flex-1 min-w-0">
			<div class="flex items-center justify-between mb-1">
				<h3 class="font-bold text-sm sm:text-lg theme-text capitalize truncate">
					{pokemon.name}
				</h3>
				<span class="text-xs sm:text-sm theme-text-secondary">
					#{pokemon.id.toString().padStart(3, '0')}
				</span>
			</div>
			
			<!-- Types -->
			<div class="flex gap-1 mb-1.5 sm:mb-2 flex-wrap">
				{#each pokemon.types as type}
					<TypeBadge type={type.type.name} size={compact ? 'sm' : 'md'} />
				{/each}
			</div>
			
			<!-- Stats Total (if not compact) -->
			{#if !compact}
				<div class="text-xs sm:text-sm theme-text-secondary">
					Base Stats Total: <span class="font-semibold {getStatTotalColor(getStatTotal(pokemon))}">{getStatTotal(pokemon)}</span>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Detailed Stats -->
	{#if showStats && !compact}
		<div class="mt-3 sm:mt-4 pt-3 sm:pt-4 theme-border" style="border-top: 1px solid var(--border-color);">
			<h4 class="text-xs sm:text-sm font-semibold theme-text-secondary mb-1.5 sm:mb-2">Base Stats</h4>
			<div class="space-y-1.5">
				{#each pokemon.stats as stat}
					<StatBar name={stat.stat.name} value={stat.base_stat} />
				{/each}
			</div>
		</div>
	{/if}
	
	<!-- Add to Team Button -->
	{#if showAddToTeam}
		<div class="mt-2 sm:mt-3 pt-2 sm:pt-3 theme-border" style="border-top: 1px solid var(--border-color);">
			<slot name="add-to-team" />
		</div>
	{/if}
</div>
{/if}
