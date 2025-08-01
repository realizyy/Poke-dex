import { writable } from 'svelte/store';
import type { Team, TeamPokemon, Pokemon } from '$lib/types';
import { toastStore } from './toast-store';

function createTeamStore() {
	const { subscribe, set, update } = writable<Team[]>([]);

	return {
		subscribe,

		// Load teams from localStorage
		loadTeams: () => {
			if (typeof window !== 'undefined') {
				const saved = localStorage.getItem('pokemon-teams');
				if (saved) {
					try {
						const teams = JSON.parse(saved);
						set(teams);
					} catch (e) {
						console.error('Failed to load teams from localStorage:', e);
					}
				}
			}
		},

		// Save teams to localStorage
		saveTeams: (teams: Team[]) => {
			if (typeof window !== 'undefined') {
				localStorage.setItem('pokemon-teams', JSON.stringify(teams));
			}
		},

		// Create new team
		createTeam: (name: string) => {
			const newTeam: Team = {
				id: Date.now().toString(),
				name,
				pokemons: [],
				createdAt: new Date()
			};

			update((teams) => {
				const updatedTeams = [...teams, newTeam];
				if (typeof window !== 'undefined') {
					localStorage.setItem('pokemon-teams', JSON.stringify(updatedTeams));
				}
				return updatedTeams;
			});

			toastStore.success('Team Created', `Team "${name}" has been created successfully!`);
			return newTeam;
		},

		// Delete team
		deleteTeam: (teamId: string) => {
			let deletedTeamName = '';
			update((teams) => {
				const teamToDelete = teams.find(team => team.id === teamId);
				deletedTeamName = teamToDelete?.name || 'Unknown Team';
				
				const updatedTeams = teams.filter((team) => team.id !== teamId);
				if (typeof window !== 'undefined') {
					localStorage.setItem('pokemon-teams', JSON.stringify(updatedTeams));
				}
				return updatedTeams;
			});
			
			toastStore.warning('Team Deleted', `Team "${deletedTeamName}" has been deleted`);
		},

		// Add Pokemon to team
		addPokemonToTeam: (
			teamId: string,
			pokemon: Pokemon,
			moves: string[] = [],
			nickname?: string
		) => {
			let success = false;
			let teamName = '';
			let updatedTeam: Team | null = null;
			
			update((teams) => {
				const updatedTeams = teams.map((team) => {
					if (team.id === teamId) {
						teamName = team.name;
						if (team.pokemons.length < 6) {
							const teamPokemon: TeamPokemon = {
								pokemon,
								moves: moves.slice(0, 4), // Max 4 moves
								nickname
							};
							success = true;
							updatedTeam = {
								...team,
								pokemons: [...team.pokemons, teamPokemon]
							};
							return updatedTeam;
						}
					}
					return team;
				});

				if (typeof window !== 'undefined') {
					localStorage.setItem('pokemon-teams', JSON.stringify(updatedTeams));
				}
				return updatedTeams;
			});
			
			// Update currentTeam if it's the same team being modified
			if (updatedTeam) {
				currentTeam.update(current => {
					if (current && current.id === teamId) {
						return updatedTeam;
					}
					return current;
				});
			}
			
			if (success) {
				const displayName = nickname || pokemon.name;
				toastStore.success('Pokémon Added', `${displayName} has been added to ${teamName}!`);
			} else {
				toastStore.error('Team Full', 'Cannot add more Pokémon. Team is already full (6/6)');
			}
		},

		// Remove Pokemon from team
		removePokemonFromTeam: (teamId: string, pokemonIndex: number) => {
			let removedPokemonName = '';
			let updatedTeam: Team | null = null;
			
			update((teams) => {
				const updatedTeams = teams.map((team) => {
					if (team.id === teamId) {
						const pokemonToRemove = team.pokemons[pokemonIndex];
						removedPokemonName = pokemonToRemove?.nickname || pokemonToRemove?.pokemon.name || 'Unknown Pokémon';
						
						updatedTeam = {
							...team,
							pokemons: team.pokemons.filter((_, index) => index !== pokemonIndex)
						};
						return updatedTeam;
					}
					return team;
				});

				if (typeof window !== 'undefined') {
					localStorage.setItem('pokemon-teams', JSON.stringify(updatedTeams));
				}
				return updatedTeams;
			});
			
			// Update currentTeam if it's the same team being modified
			if (updatedTeam) {
				currentTeam.update(current => {
					if (current && current.id === teamId) {
						return updatedTeam;
					}
					return current;
				});
			}
			
			if (removedPokemonName) {
				toastStore.info('Pokémon Removed', `${removedPokemonName} has been removed from the team`);
			}
		},

		// Update Pokemon moves
		updatePokemonMoves: (teamId: string, pokemonIndex: number, moves: string[]) => {
			update((teams) => {
				const updatedTeams = teams.map((team) => {
					if (team.id === teamId && team.pokemons[pokemonIndex]) {
						const updatedPokemons = [...team.pokemons];
						updatedPokemons[pokemonIndex] = {
							...updatedPokemons[pokemonIndex],
							moves: moves.slice(0, 4)
						};
						return {
							...team,
							pokemons: updatedPokemons
						};
					}
					return team;
				});

				if (typeof window !== 'undefined') {
					localStorage.setItem('pokemon-teams', JSON.stringify(updatedTeams));
				}
				return updatedTeams;
			});
		},

		// Update Pokemon nickname
		updatePokemonNickname: (teamId: string, pokemonIndex: number, nickname: string) => {
			update((teams) => {
				const updatedTeams = teams.map((team) => {
					if (team.id === teamId && team.pokemons[pokemonIndex]) {
						const updatedPokemons = [...team.pokemons];
						updatedPokemons[pokemonIndex] = {
							...updatedPokemons[pokemonIndex],
							nickname
						};
						return {
							...team,
							pokemons: updatedPokemons
						};
					}
					return team;
				});

				if (typeof window !== 'undefined') {
					localStorage.setItem('pokemon-teams', JSON.stringify(updatedTeams));
				}
				return updatedTeams;
			});
		},

		// Update team name
		updateTeamName: (teamId: string, newName: string) => {
			update((teams) => {
				const updatedTeams = teams.map((team) => {
					if (team.id === teamId) {
						return { ...team, name: newName };
					}
					return team;
				});

				if (typeof window !== 'undefined') {
					localStorage.setItem('pokemon-teams', JSON.stringify(updatedTeams));
				}
				return updatedTeams;
			});
		}
	};
}

export const teamStore = createTeamStore();

// Current team being edited
export const currentTeam = writable<Team | null>(null);
