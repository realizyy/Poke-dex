import { writable } from 'svelte/store';
import type { Team, TeamPokemon, Pokemon } from '$lib/types';

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

			return newTeam;
		},

		// Delete team
		deleteTeam: (teamId: string) => {
			update((teams) => {
				const updatedTeams = teams.filter((team) => team.id !== teamId);
				if (typeof window !== 'undefined') {
					localStorage.setItem('pokemon-teams', JSON.stringify(updatedTeams));
				}
				return updatedTeams;
			});
		},

		// Add Pokemon to team
		addPokemonToTeam: (
			teamId: string,
			pokemon: Pokemon,
			moves: string[] = [],
			nickname?: string
		) => {
			update((teams) => {
				const updatedTeams = teams.map((team) => {
					if (team.id === teamId && team.pokemons.length < 6) {
						const teamPokemon: TeamPokemon = {
							pokemon,
							moves: moves.slice(0, 4), // Max 4 moves
							nickname
						};
						return {
							...team,
							pokemons: [...team.pokemons, teamPokemon]
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

		// Remove Pokemon from team
		removePokemonFromTeam: (teamId: string, pokemonIndex: number) => {
			update((teams) => {
				const updatedTeams = teams.map((team) => {
					if (team.id === teamId) {
						return {
							...team,
							pokemons: team.pokemons.filter((_, index) => index !== pokemonIndex)
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
