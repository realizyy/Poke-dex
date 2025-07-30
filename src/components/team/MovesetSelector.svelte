<script lang="ts">
	import type { Pokemon } from '$lib/types';
	import { getTypeColor } from '$lib/utils/pokemon-utils';
	
	export let pokemon: Pokemon;
	export let onMovesSelected: (moves: string[]) => void = () => {};
	
	let selectedMoves: string[] = [];
	
	// Sample movesets - in a real app, you'd fetch this from the API
	const recommendedMoves = [
		'thunderbolt', 'thunder-wave', 'quick-attack', 'agility',
		'tackle', 'body-slam', 'double-edge', 'substitute',
		'flamethrower', 'fire-blast', 'solar-beam', 'earthquake',
		'surf', 'ice-beam', 'psychic', 'shadow-ball',
		'aerial-ace', 'dragon-claw', 'steel-wing', 'rock-slide'
	];
	
	// Get moves available to this Pokemon (simplified)
	$: availableMoves = pokemon.moves
		? pokemon.moves.slice(0, 20).map(m => m.move.name)
		: recommendedMoves.slice(0, 12);
	
	function toggleMove(move: string) {
		if (selectedMoves.includes(move)) {
			selectedMoves = selectedMoves.filter(m => m !== move);
		} else if (selectedMoves.length < 4) {
			selectedMoves = [...selectedMoves, move];
		}
		onMovesSelected(selectedMoves);
	}
	
	function getRecommendedMoveset() {
		// Simple recommendation based on Pokemon types
		const types = pokemon.types.map(t => t.type.name);
		const recommended = [];
		
		if (types.includes('electric')) {
			recommended.push('thunderbolt', 'thunder-wave');
		}
		if (types.includes('fire')) {
			recommended.push('flamethrower', 'fire-blast');
		}
		if (types.includes('water')) {
			recommended.push('surf', 'ice-beam');
		}
		if (types.includes('grass')) {
			recommended.push('solar-beam', 'energy-ball');
		}
		
		// Fill remaining slots with coverage moves
		while (recommended.length < 4) {
			const coverageMoves = ['earthquake', 'psychic', 'shadow-ball', 'aerial-ace'];
			const moveToAdd: string = coverageMoves[recommended.length % coverageMoves.length];
			if (!recommended.includes(moveToAdd)) {
				recommended.push(moveToAdd);
			} else {
				break; // Prevent infinite loop
			}
		}
		
		selectedMoves = recommended.slice(0, 4);
		onMovesSelected(selectedMoves);
	}
	
	function formatMoveName(move: string): string {
		return move.split('-').map(word => 
			word.charAt(0).toUpperCase() + word.slice(1)
		).join(' ');
	}
</script>

<div class="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
	<div class="flex justify-between items-center mb-4">
		<h3 class="text-lg font-semibold text-gray-900 dark:text-white">
			Select Moves for {pokemon.name}
		</h3>
		<button
			on:click={getRecommendedMoveset}
			class="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium transition-colors"
		>
			Auto-Recommend
		</button>
	</div>
	
	<div class="mb-4">
		<p class="text-sm text-gray-600 dark:text-gray-400">
			Selected: {selectedMoves.length}/4 moves
		</p>
		{#if selectedMoves.length > 0}
			<div class="flex flex-wrap gap-2 mt-2">
				{#each selectedMoves as move}
					<span class="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
						{formatMoveName(move)}
					</span>
				{/each}
			</div>
		{/if}
	</div>
	
	<div class="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
		{#each availableMoves as move}
			<button
				on:click={() => toggleMove(move)}
				disabled={!selectedMoves.includes(move) && selectedMoves.length >= 4}
				class="p-2 text-left rounded-lg border-2 transition-all text-sm {selectedMoves.includes(move) 
					? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-900 dark:text-blue-300' 
					: 'border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-500 disabled:opacity-50 disabled:cursor-not-allowed'}"
			>
				{formatMoveName(move)}
			</button>
		{/each}
	</div>
	
	<div class="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
		<h4 class="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-1">
			Strategy Tips:
		</h4>
		<ul class="text-xs text-blue-800 dark:text-blue-200 space-y-1">
			<li>• Include STAB (Same Type Attack Bonus) moves for maximum damage</li>
			<li>• Add coverage moves to handle type weaknesses</li>
			<li>• Consider status moves for utility (paralysis, sleep, etc.)</li>
			<li>• Balance offensive and defensive options</li>
		</ul>
	</div>
</div>
