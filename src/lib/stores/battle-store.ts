import { writable } from 'svelte/store';
import type { BattleState, Team, TeamPokemon, BattleResult } from '$lib/types';
import { BattleService } from '$lib/services/battle-service';

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
		},

		selectTeam2: (team: Team | null) => {
			update(state => ({
				...state,
				selectedTeam2: team,
				selectedPokemon2: null, // Reset Pokemon selection when team changes
				battleLog: [],
				battleResult: null
			}));
		},

		// Pokemon selection
		selectPokemon1: (pokemon: TeamPokemon | null) => {
			update(state => ({
				...state,
				selectedPokemon1: pokemon,
				battleLog: [],
				battleResult: null
			}));
		},

		selectPokemon2: (pokemon: TeamPokemon | null) => {
			update(state => ({
				...state,
				selectedPokemon2: pokemon,
				battleLog: [],
				battleResult: null
			}));
		},

		// Battle simulation
		simulateBattle: () => {
			update(state => {
				if (!state.selectedPokemon1 || !state.selectedPokemon2) {
					return state;
				}

				const newState = {
					...state,
					battleInProgress: true,
					battleLog: [],
					battleResult: null
				};

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
		},

		resetAll: () => {
			set(initialState);
		},

		// Utility functions
		canStartBattle: (state: BattleState): boolean => {
			return !!(state.selectedPokemon1 && state.selectedPokemon2 && !state.battleInProgress);
		}
	};
}

export const battleStore = createBattleStore();