import { writable } from 'svelte/store';
import type { Pokemon } from '$lib/types';

export interface ModalState {
	addToTeam: {
		show: boolean;
		pokemon: Pokemon | null;
	};
	// Add more modals here as needed
	// battle: { show: boolean; ... }
	// settings: { show: boolean; ... }
}

const initialState: ModalState = {
	addToTeam: {
		show: false,
		pokemon: null
	}
};

function createModalStore() {
	const { subscribe, set, update } = writable<ModalState>(initialState);

	return {
		subscribe,

		// Add to Team Modal
		openAddToTeamModal: (pokemon: Pokemon) => {
			update(state => ({
				...state,
				addToTeam: {
					show: true,
					pokemon
				}
			}));
		},

		closeAddToTeamModal: () => {
			update(state => ({
				...state,
				addToTeam: {
					show: false,
					pokemon: null
				}
			}));
		},

		// Close all modals
		closeAllModals: () => {
			set(initialState);
		},

		// Generic modal handler for future modals
		toggleModal: (modalName: keyof ModalState, show: boolean, data?: any) => {
			update(state => ({
				...state,
				[modalName]: {
					show,
					...(data && data)
				}
			}));
		}
	};
}

export const modalStore = createModalStore();