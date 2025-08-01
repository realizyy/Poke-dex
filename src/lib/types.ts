export interface Pokemon {
	id: number;
	name: string;
	types: { type: { name: string } }[];
	sprites: { other: { 'official-artwork': { front_default: string } } };
	stats: { base_stat: number; stat: { name: string } }[];
	abilities: { ability: { name: string } }[];
	moves: { move: { name: string } }[];
	species: { url: string };
	base_experience: number;
	height: number;
	weight: number;
}

export interface PokemonSpecies {
	generation: { name: string };
	color: { name: string };
	habitat: { name: string } | null;
	capture_rate: number;
	evolution_chain?: { url: string };
}

export interface TeamPokemon {
	pokemon: Pokemon;
	moves: string[];
	nickname?: string;
}

export interface Team {
	id: string;
	name: string;
	pokemons: TeamPokemon[];
	createdAt: Date;
}

export interface TypeEffectiveness {
	[key: string]: {
		weakTo: string[];
		resistantTo: string[];
		immuneTo: string[];
		superEffectiveAgainst: string[];
		notVeryEffectiveAgainst: string[];
		noEffectAgainst: string[];
	};
}

export interface SearchFilters {
	types: string[];
	generations: string[];
	minStats?: {
		[key: string]: number;
	};
	maxStats?: {
		[key: string]: number;
	};
}

export interface ColorType {
	[key: string]: string;
}

// Search related types
export interface SearchResult {
	pokemons: Pokemon[];
	hasMore: boolean;
	totalResults: number;
}

export type SortBy = 'id' | 'name' | 'stats';
export type SortOrder = 'asc' | 'desc';

// Modal related types
export interface AddToTeamModalData {
	show: boolean;
	pokemon: Pokemon | null;
}

// Event types for components
export interface SearchEvent {
	query: string;
	filters: SearchFilters;
}

export interface TeamSelectedEvent {
	teamId: string;
	pokemon: Pokemon;
}

// Battle types
export interface BattleState {
	selectedTeam1: Team | null;
	selectedTeam2: Team | null;
	selectedPokemon1: TeamPokemon | null;
	selectedPokemon2: TeamPokemon | null;
	battleLog: string[];
	battleInProgress: boolean;
	battleResult: BattleResult | null;
}

export interface BattleResult {
	winner: 'team1' | 'team2' | 'draw';
	winnerPokemon?: TeamPokemon;
	loserPokemon?: TeamPokemon;
	totalTurns: number;
}

export interface BattleDamageResult {
	damage: number;
	effectiveness: number;
	message: string;
}

export interface BattlePokemonStats {
	hp: number;
	maxHp: number;
	attack: number;
	defense: number;
	speed: number;
}

// Toast notification types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
	id: string;
	type: ToastType;
	title: string;
	message?: string;
	duration?: number;
	persistent?: boolean;
	createdAt: Date;
}

export interface ToastOptions {
	type?: ToastType;
	title: string;
	message?: string;
	duration?: number;
	persistent?: boolean;
}
