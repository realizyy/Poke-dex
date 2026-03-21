import type { Team, TeamPokemon, Pokemon } from '$lib/types';
import { toastStore } from './toast-store.svelte';

class TeamStore {
	teams: Team[] = $state([]);
	currentTeam: Team | null = $state(null);

	loadTeams() {
		if (typeof window === 'undefined') return;
		const saved = localStorage.getItem('pokemon-teams');
		if (!saved) return;
		try {
			this.teams = JSON.parse(saved);
			// Restore last selected team across refreshes
			const selectedId = localStorage.getItem('pokemon-teams-selected');
			if (selectedId) {
				this.currentTeam = this.teams.find(t => t.id === selectedId) ?? null;
			}
		} catch {
			console.error('Failed to load teams from localStorage');
		}
	}

	private save(teams: Team[]) {
		if (typeof window !== 'undefined') {
			localStorage.setItem('pokemon-teams', JSON.stringify(teams));
		}
	}

	createTeam(name: string): Team {
		const newTeam: Team = {
			id: Date.now().toString(),
			name,
			pokemons: [],
			createdAt: new Date()
		};
		this.teams = [...this.teams, newTeam];
		this.save(this.teams);
		toastStore.success('Team Created', `Team "${name}" has been created successfully!`);
		return newTeam;
	}

	deleteTeam(teamId: string) {
		const team = this.teams.find((t) => t.id === teamId);
		this.teams = this.teams.filter((t) => t.id !== teamId);
		this.save(this.teams);
		if (this.currentTeam?.id === teamId) {
			this.currentTeam = null;
			if (typeof window !== 'undefined') localStorage.removeItem('pokemon-teams-selected');
		}
		toastStore.warning('Team Deleted', `Team "${team?.name ?? 'Unknown'}" has been deleted`);
	}

	addPokemonToTeam(teamId: string, pokemon: Pokemon, moves: string[] = [], nickname?: string) {
		let success = false;
		let teamName = '';

		this.teams = this.teams.map((team) => {
			if (team.id !== teamId) return team;
			teamName = team.name;
			if (team.pokemons.length >= 6) return team;
			success = true;
			const updated: Team = {
				...team,
				pokemons: [...team.pokemons, { pokemon, moves: moves.slice(0, 4), nickname }]
			};
			if (this.currentTeam?.id === teamId) this.currentTeam = updated;
			return updated;
		});

		this.save(this.teams);

		if (success) {
			toastStore.success('Pokémon Added', `${nickname ?? pokemon.name} has been added to ${teamName}!`);
		} else {
			toastStore.error('Team Full', 'Cannot add more Pokémon. Team is already full (6/6)');
		}
	}

	removePokemonFromTeam(teamId: string, pokemonIndex: number) {
		let removedName = '';

		this.teams = this.teams.map((team) => {
			if (team.id !== teamId) return team;
			removedName = team.pokemons[pokemonIndex]?.nickname ?? team.pokemons[pokemonIndex]?.pokemon.name ?? 'Unknown';
			const updated: Team = {
				...team,
				pokemons: team.pokemons.filter((_, i) => i !== pokemonIndex)
			};
			if (this.currentTeam?.id === teamId) this.currentTeam = updated;
			return updated;
		});

		this.save(this.teams);
		if (removedName) toastStore.info('Pokémon Removed', `${removedName} has been removed from the team`);
	}

	updatePokemonMoves(teamId: string, pokemonIndex: number, moves: string[]) {
		this.teams = this.teams.map((team) => {
			if (team.id !== teamId || !team.pokemons[pokemonIndex]) return team;
			const pokemons = [...team.pokemons];
			pokemons[pokemonIndex] = { ...pokemons[pokemonIndex], moves: moves.slice(0, 4) };
			return { ...team, pokemons };
		});
		this.save(this.teams);
	}

	updatePokemonNickname(teamId: string, pokemonIndex: number, nickname: string) {
		this.teams = this.teams.map((team) => {
			if (team.id !== teamId || !team.pokemons[pokemonIndex]) return team;
			const pokemons = [...team.pokemons];
			pokemons[pokemonIndex] = { ...pokemons[pokemonIndex], nickname };
			return { ...team, pokemons };
		});
		this.save(this.teams);
	}

	updateTeamName(teamId: string, newName: string) {
		this.teams = this.teams.map((team) =>
			team.id === teamId ? { ...team, name: newName } : team
		);
		this.save(this.teams);
	}

	selectTeam(team: Team | null) {
		this.currentTeam = team;
		if (typeof window !== 'undefined') {
			if (team) {
				localStorage.setItem('pokemon-teams-selected', team.id);
			} else {
				localStorage.removeItem('pokemon-teams-selected');
			}
		}
	}
}

export const teamStore = new TeamStore();

// Backward-compat: expose currentTeam as a direct reference
export const currentTeamRef = {
	get value() { return teamStore.currentTeam; },
	set value(v: Team | null) { teamStore.currentTeam = v; }
};
