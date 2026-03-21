import type { Pokemon } from '$lib/types';

class ModalStore {
	addToTeam = $state<{ show: boolean; pokemon: Pokemon | null }>({
		show: false,
		pokemon: null
	});

	openAddToTeamModal(pokemon: Pokemon) {
		this.addToTeam = { show: true, pokemon };
	}

	closeAddToTeamModal() {
		this.addToTeam = { show: false, pokemon: null };
	}

	closeAllModals() {
		this.addToTeam = { show: false, pokemon: null };
	}
}

export const modalStore = new ModalStore();
