import { beforeEach, describe, expect, it } from 'vitest';
import { makePokemon } from '#lib/testing/fixtures';
import type { Team } from '#lib/types';
import { teamStore } from './team.svelte';
import { toastStore } from './toast-store.svelte';

beforeEach(() => {
	localStorage.clear();
	teamStore.teams = [];
	teamStore.currentTeam = null;
	toastStore.toasts = [];
});

describe('teamStore', () => {
	it('creates a team and persists it', () => {
		const team = teamStore.createTeam('Kanto');
		expect(teamStore.teams.map((t) => t.name)).toEqual(['Kanto']);
		expect(JSON.parse(localStorage.getItem('pokemon-teams')!)[0].id).toBe(team.id);
	});

	it('reloads teams and the selected team from storage', () => {
		const team = teamStore.createTeam('Johto');
		teamStore.selectTeam(team);
		teamStore.teams = [];
		teamStore.currentTeam = null;
		teamStore.loadTeams();
		expect(teamStore.teams).toHaveLength(1);
		expect((teamStore.currentTeam as Team | null)?.id).toBe(team.id);
	});

	it('adds up to six Pokemon and rejects the seventh', () => {
		const team = teamStore.createTeam('Full');
		for (let i = 1; i <= 7; i++) {
			teamStore.addPokemonToTeam(team.id, makePokemon({ id: i, name: `mon${i}` }));
		}
		expect(teamStore.teams[0].pokemons).toHaveLength(6);
		expect(toastStore.toasts.some((t) => t.title === 'Team Full')).toBe(true);
	});

	it('keeps at most four moves per Pokemon', () => {
		const team = teamStore.createTeam('Moves');
		teamStore.addPokemonToTeam(team.id, makePokemon(), ['a', 'b', 'c', 'd', 'e']);
		expect(teamStore.teams[0].pokemons[0].moves).toEqual(['a', 'b', 'c', 'd']);
	});

	it('removes a Pokemon by index', () => {
		const team = teamStore.createTeam('Remove');
		teamStore.addPokemonToTeam(team.id, makePokemon({ id: 1, name: 'one' }));
		teamStore.addPokemonToTeam(team.id, makePokemon({ id: 2, name: 'two' }));
		teamStore.removePokemonFromTeam(team.id, 0);
		expect(teamStore.teams[0].pokemons.map((p) => p.pokemon.name)).toEqual(['two']);
	});

	it('clears the selection when the selected team is deleted', () => {
		const team = teamStore.createTeam('Gone');
		teamStore.selectTeam(team);
		teamStore.deleteTeam(team.id);
		expect(teamStore.teams).toEqual([]);
		expect(teamStore.currentTeam).toBeNull();
		expect(localStorage.getItem('pokemon-teams-selected')).toBeNull();
	});

	it('keeps the selected team in sync after a rename, moveset or nickname change', () => {
		const team = teamStore.createTeam('Old');
		teamStore.selectTeam(team);
		teamStore.addPokemonToTeam(team.id, makePokemon());
		teamStore.updateTeamName(team.id, 'New');
		teamStore.updatePokemonMoves(team.id, 0, ['thunderbolt']);
		teamStore.updatePokemonNickname(team.id, 0, 'Sparky');
		expect(teamStore.currentTeam?.name).toBe('New');
		expect(teamStore.currentTeam?.pokemons[0].moves).toEqual(['thunderbolt']);
		expect(teamStore.currentTeam?.pokemons[0].nickname).toBe('Sparky');
	});
});
