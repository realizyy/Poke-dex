import { writable } from 'svelte/store';
import type { BattleState, Team, TeamPokemon, BattleResult } from '$lib/types';
import { BattleService } from '$lib/services/battle-service';
import { toastStore } from './toast-store';

const initialState: BattleState = {
	selectedTeam1: null,
	selectedTeam2: null,
	selectedPokemon1: null,
	selectedPokemon2: null,
	battleLog: [],
	battleInProgress: false,
	battleResult: null
};

function createBattleStore() {
	const { subscribe, set, update } = writable<BattleState>(initialState);

	return {
		subscribe,
		
		// Team selection
		selectTeam1: (team: Team | null) => {
			update(state => ({
				...state,
				selectedTeam1: team,
				selectedPokemon1: null, // Reset Pokemon selection when team changes
				battleLog: [],
				battleResult: null
			}));
			
			if (team) {
				toastStore.info('Team Selected', `${team.name} selected for Team 1`);
			}
		},

		selectTeam2: (team: Team | null) => {
			update(state => ({
				...state,
				selectedTeam2: team,
				selectedPokemon2: null, // Reset Pokemon selection when team changes
				battleLog: [],
				battleResult: null
			}));
			
			if (team) {
				toastStore.info('Team Selected', `${team.name} selected for Team 2`);
			}
		},

		// Pokemon selection
		selectPokemon1: (pokemon: TeamPokemon | null) => {
			update(state => ({
				...state,
				selectedPokemon1: pokemon,
				battleLog: [],
				battleResult: null
			}));
			
			if (pokemon) {
				toastStore.success('Pokémon Ready', `${pokemon.nickname || pokemon.pokemon.name} is ready to battle!`);
			}
		},

		selectPokemon2: (pokemon: TeamPokemon | null) => {
			update(state => ({
				...state,
				selectedPokemon2: pokemon,
				battleLog: [],
				battleResult: null
			}));
			
			if (pokemon) {
				toastStore.success('Pokémon Ready', `${pokemon.nickname || pokemon.pokemon.name} is ready to battle!`);
			}
		},

		// Battle simulation
		simulateBattle: () => {
			update(state => {
				if (!state.selectedPokemon1 || !state.selectedPokemon2) {
					toastStore.error('Battle Error', 'Please select Pokémon for both teams before starting battle');
					return state;
				}

				const newState = {
					...state,
					battleInProgress: true,
					battleLog: [],
					battleResult: null
				};

				toastStore.info('Battle Started', 'The battle is beginning!');

				// Start battle simulation
				setTimeout(() => {
					const result = BattleService.simulateBattle(
						state.selectedPokemon1!,
						state.selectedPokemon2!,
						(logEntry) => {
							update(currentState => ({
								...currentState,
								battleLog: [...currentState.battleLog, logEntry]
							}));
						}
					);

					update(currentState => ({
						...currentState,
						battleInProgress: false,
						battleResult: result
					}));

					// Show battle result toast
					if (result.winner === 'draw') {
						toastStore.warning('Battle Complete', 'The battle ended in a draw!');
					} else {
						const winnerName = result.winnerPokemon?.nickname || result.winnerPokemon?.pokemon.name;
						toastStore.success('Battle Complete', `${winnerName} wins the battle!`);
					}
				}, 100);

				return newState;
			});
		},

		// Reset functions
		resetBattle: () => {
			update(state => ({
				...state,
				selectedPokemon1: null,
				selectedPokemon2: null,
				battleLog: [],
				battleInProgress: false,
				battleResult: null
			}));
			toastStore.info('Battle Reset', 'Battle arena has been reset');
		},

		resetAll: () => {
			set(initialState);
			toastStore.info('Arena Reset', 'Battle arena has been completely reset');
		},

		// Utility functions
		canStartBattle: (state: BattleState): boolean => {
			return !!(state.selectedPokemon1 && state.selectedPokemon2 && !state.battleInProgress);
		}
	};
}

export const battleStore = createBattleStore();