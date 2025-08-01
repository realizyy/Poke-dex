<script lang="ts">
	import type { Pokemon } from '$lib/types';
	import { getTypeColor } from '$lib/utils/pokemon-utils';

	export let pokemon: Pokemon;
	export let onMovesSelected: (moves: string[]) => void = () => {};

	let selectedMoves: string[] = [];

	// Sample movesets - in a real app, you'd fetch this from the API
	const recommendedMoves = [
		'thunderbolt',
		'thunder-wave',
		'quick-attack',
		'agility',
		'tackle',
		'body-slam',
		'double-edge',
		'substitute',
		'flamethrower',
		'fire-blast',
		'solar-beam',
		'earthquake',
		'surf',
		'ice-beam',
		'psychic',
		'shadow-ball',
		'aerial-ace',
		'dragon-claw',
		'steel-wing',
		'rock-slide'
	];

	// Get moves available to this Pokemon (simplified)
	$: availableMoves = pokemon.moves
		? pokemon.moves.slice(0, 20).map((m) => m.move.name)
		: recommendedMoves.slice(0, 12);

	function toggleMove(move: string) {
		if (selectedMoves.includes(move)) {
			selectedMoves = selectedMoves.filter((m) => m !== move);
		} else if (selectedMoves.length < 4) {
			selectedMoves = [...selectedMoves, move];
		}
		onMovesSelected(selectedMoves);
	}

	function getRecommendedMoveset() {
		// Simple recommendation based on Pokemon types
		const types = pokemon.types.map((t) => t.type.name);
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
		return move
			.split('-')
			.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}
</script>

<div
	class="rounded-xl theme-border theme-bg-secondary p-6 shadow-lg"
	style="border-color: var(--border-color); background-color: var(--bg-secondary);"
>
	<div class="mb-4 flex items-center justify-between">
		<h3 class="text-lg font-semibold theme-text">
			Select Moves for {pokemon.name}
		</h3>
		<button
			on:click={getRecommendedMoveset}
			class="rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
		>
			Auto-Recommend
		</button>
	</div>

	<div class="mb-4">
		<p class="text-sm theme-text-secondary">
			Selected: {selectedMoves.length}/4 moves
		</p>
		{#if selectedMoves.length > 0}
			<div class="mt-2 flex flex-wrap gap-2">
				{#each selectedMoves as move}
					<span class="rounded-full bg-blue-500 px-3 py-1 text-sm font-medium text-white">
						{formatMoveName(move)}
					</span>
				{/each}
			</div>
		{/if}
	</div>

	<div class="grid max-h-64 grid-cols-2 gap-2 overflow-y-auto md:grid-cols-3">
		{#each availableMoves as move}
			<button
				on:click={() => toggleMove(move)}
				disabled={!selectedMoves.includes(move) && selectedMoves.length >= 4}
				class="rounded-lg border-2 p-2 text-left text-sm transition-all {selectedMoves.includes(
					move
				)
					? 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/20 dark:text-blue-300'
					: 'theme-border theme-text-secondary hover:border-blue-300 disabled:cursor-not-allowed disabled:opacity-50'}"
				style="{!selectedMoves.includes(move) ? 'border-color: var(--border-color); color: var(--text-secondary);' : ''}"
			>
				{formatMoveName(move)}
			</button>
		{/each}
	</div>

	<div class="mt-4 rounded-lg bg-blue-50 p-3 dark:bg-blue-900/20">
		<h4 class="mb-1 text-sm font-semibold text-blue-900 dark:text-blue-300">Strategy Tips:</h4>
		<ul class="space-y-1 text-xs text-blue-800 dark:text-blue-200">
			<li>• Include STAB (Same Type Attack Bonus) moves for maximum damage</li>
			<li>• Add coverage moves to handle type weaknesses</li>
			<li>• Consider status moves for utility (paralysis, sleep, etc.)</li>
			<li>• Balance offensive and defensive options</li>
		</ul>
	</div>
</div>
