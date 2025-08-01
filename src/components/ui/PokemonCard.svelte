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
					<span
						class="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold text-white capitalize"
						style="background-color: {getTypeColor(type.type.name)}"
					>
						{type.type.name}
					</span>
				{/each}
			</div>
			
			<!-- Stats Total (if not compact) -->
			{#if !compact}
				<div class="text-xs sm:text-sm theme-text-secondary">
					Base Stats Total: <span class="font-semibold {getStatColor(getStatTotal(pokemon))}">{getStatTotal(pokemon)}</span>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Detailed Stats -->
	{#if showStats && !compact}
		<div class="mt-3 sm:mt-4 pt-3 sm:pt-4 theme-border" style="border-top: 1px solid var(--border-color);">
			<h4 class="text-xs sm:text-sm font-semibold theme-text-secondary mb-1.5 sm:mb-2">Base Stats</h4>
			<div class="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
				{#each pokemon.stats as stat}
					<div class="flex justify-between">
						<span class="theme-text-muted">
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
					<span
						class="px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-xs font-semibold text-white capitalize"
						style="background-color: {getTypeColor(type.type.name)}"
					>
						{type.type.name}
					</span>
				{/each}
			</div>
			
			<!-- Stats Total (if not compact) -->
			{#if !compact}
				<div class="text-xs sm:text-sm theme-text-secondary">
					Base Stats Total: <span class="font-semibold {getStatColor(getStatTotal(pokemon))}">{getStatTotal(pokemon)}</span>
				</div>
			{/if}
		</div>
	</div>
	
	<!-- Detailed Stats -->
	{#if showStats && !compact}
		<div class="mt-3 sm:mt-4 pt-3 sm:pt-4 theme-border" style="border-top: 1px solid var(--border-color);">
			<h4 class="text-xs sm:text-sm font-semibold theme-text-secondary mb-1.5 sm:mb-2">Base Stats</h4>
			<div class="grid grid-cols-2 gap-1.5 sm:gap-2 text-xs">
				{#each pokemon.stats as stat}
					<div class="flex justify-between">
						<span class="theme-text-muted">
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
		<div class="mt-2 sm:mt-3 pt-2 sm:pt-3 theme-border" style="border-top: 1px solid var(--border-color);">
			<slot name="add-to-team" />
		</div>
	{/if}
</div>
{/if}
