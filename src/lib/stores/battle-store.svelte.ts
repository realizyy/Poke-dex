import type { BattleState, Team, TeamPokemon } from '$lib/types';
import { BattleService } from '$lib/services/battle-service';
import { toastStore } from './toast-store.svelte';

class BattleStore {
	selectedTeam1: Team | null = $state(null);
	selectedTeam2: Team | null = $state(null);
	selectedPokemon1: TeamPokemon | null = $state(null);
	selectedPokemon2: TeamPokemon | null = $state(null);
	battleLog: string[] = $state([]);
	battleInProgress: boolean = $state(false);
	battleResult: BattleState['battleResult'] = $state(null);

	canStartBattle = $derived(
		!!this.selectedPokemon1 && !!this.selectedPokemon2 && !this.battleInProgress
	);

	/** Restore team selections from localStorage after teamStore.loadTeams() */
	loadBattleState(teams: Team[]) {
		if (typeof window === 'undefined') return;
		const t1Id = localStorage.getItem('battle-team1');
		const t2Id = localStorage.getItem('battle-team2');
		if (t1Id) this.selectedTeam1 = teams.find(t => t.id === t1Id) ?? null;
		if (t2Id) this.selectedTeam2 = teams.find(t => t.id === t2Id) ?? null;
	}

	selectTeam1(team: Team | null) {
		this.selectedTeam1 = team;
		this.selectedPokemon1 = null;
		this.battleLog = [];
		this.battleResult = null;
		if (typeof window !== 'undefined') {
			if (team) localStorage.setItem('battle-team1', team.id);
			else localStorage.removeItem('battle-team1');
		}
	}

	selectTeam2(team: Team | null) {
		this.selectedTeam2 = team;
		this.selectedPokemon2 = null;
		this.battleLog = [];
		this.battleResult = null;
		if (typeof window !== 'undefined') {
			if (team) localStorage.setItem('battle-team2', team.id);
			else localStorage.removeItem('battle-team2');
		}
	}

	selectPokemon1(pokemon: TeamPokemon | null) {
		this.selectedPokemon1 = pokemon;
		this.battleLog = [];
		this.battleResult = null;
	}

	selectPokemon2(pokemon: TeamPokemon | null) {
		this.selectedPokemon2 = pokemon;
		this.battleLog = [];
		this.battleResult = null;
	}

	simulateBattle() {
		if (!this.selectedPokemon1 || !this.selectedPokemon2) {
			toastStore.error('Battle Error', 'Please select Pokémon for both teams before starting battle');
			return;
		}

		this.battleInProgress = true;
		this.battleLog = [];
		this.battleResult = null;

		const p1 = this.selectedPokemon1;
		const p2 = this.selectedPokemon2;

		setTimeout(() => {
			try {
				const result = BattleService.simulateBattle(p1, p2, (logEntry) => {
					this.battleLog = [...this.battleLog, logEntry];
				});
				this.battleInProgress = false;
				this.battleResult = result;
				if (result.winner === 'draw') {
					toastStore.warning('Battle Complete', 'The battle ended in a draw!');
				} else {
					const winnerName = result.winnerPokemon?.nickname ?? result.winnerPokemon?.pokemon.name;
					toastStore.success('Battle Complete', `${winnerName} wins the battle!`);
				}
			} catch {
				this.battleInProgress = false;
				toastStore.error('Battle Error', 'Something went wrong during the battle.');
			}
		}, 100);
	}

	resetBattle() {
		this.selectedPokemon1 = null;
		this.selectedPokemon2 = null;
		this.battleLog = [];
		this.battleInProgress = false;
		this.battleResult = null;
	}

	resetAll() {
		this.selectedTeam1 = null;
		this.selectedTeam2 = null;
		this.selectedPokemon1 = null;
		this.selectedPokemon2 = null;
		this.battleLog = [];
		this.battleInProgress = false;
		this.battleResult = null;
		if (typeof window !== 'undefined') {
			localStorage.removeItem('battle-team1');
			localStorage.removeItem('battle-team2');
		}
	}
}

export const battleStore = new BattleStore();
