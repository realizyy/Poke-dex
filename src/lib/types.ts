export interface Pokemon {
	id: number;
	name: string;
	types: { type: { name: string } }[];
	sprites: {
		front_default: string | null;
		back_default: string | null;
		front_shiny: string | null;
		back_shiny: string | null;
		front_female: string | null;
		back_female: string | null;
		front_shiny_female: string | null;
		other: {
			'official-artwork': { front_default: string; front_shiny: string | null };
			dream_world: { front_default: string | null; front_female: string | null };
			home: { front_default: string | null; front_shiny: string | null; front_female: string | null; front_shiny_female: string | null };
		};
	};
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
	// Breeding / egg data
	egg_groups: { name: string; url: string }[];
	gender_rate: number; // -1 = genderless; 0–8 (female fraction × 8)
	hatch_counter: number; // steps = (hatch_counter + 1) * 256
	growth_rate: { name: string; url: string };
	baby_trigger_item: { name: string; url: string } | null;
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

// ─────────────────────────────────────────────────────────────────────────────
// Berry & Item types
// ─────────────────────────────────────────────────────────────────────────────

export interface BerryFlavor {
	potency: number;
	flavor: { name: string; url: string };
}

export interface Berry {
	id: number;
	name: string;
	growth_time: number;
	max_harvest: number;
	natural_gift_power: number;
	size: number;
	smoothness: number;
	soil_dryness: number;
	firmness: { name: string; url: string };
	flavors: BerryFlavor[];
	item: { name: string; url: string };
	natural_gift_type: { name: string; url: string };
}

export interface ItemEffectEntry {
	effect: string;
	short_effect: string;
	language: { name: string };
}

export interface Item {
	id: number;
	name: string;
	cost: number;
	fling_power: number | null;
	fling_effect: { name: string } | null;
	attributes: { name: string }[];
	category: { name: string; url: string };
	effect_entries: ItemEffectEntry[];
	flavor_text_entries: {
		text: string;
		version_group: { name: string };
		language: { name: string };
	}[];
	held_by_pokemon: { pokemon: { name: string; url: string } }[];
	sprites: { default: string | null };
}

export interface ItemCategory {
	id: number;
	name: string;
	items: { name: string; url: string }[];
	pocket: { name: string; url: string };
}

export interface ItemPocket {
	id: number;
	name: string;
	categories: { name: string; url: string }[];
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

// ─────────────────────────────────────────────────────────────────────────────
// Move types
// ─────────────────────────────────────────────────────────────────────────────

export interface MoveEffectEntry {
	effect: string;
	short_effect: string;
	language: { name: string };
}

export interface MoveFlavorText {
	flavor_text: string;
	language: { name: string };
	version_group: { name: string };
}

export interface MoveMeta {
	ailment: { name: string };
	category: { name: string };
	min_hits: number | null;
	max_hits: number | null;
	min_turns: number | null;
	max_turns: number | null;
	drain: number;
	healing: number;
	crit_rate: number;
	ailment_chance: number;
	flinch_chance: number;
	stat_chance: number;
}

export interface Move {
	id: number;
	name: string;
	accuracy: number | null;
	power: number | null;
	pp: number;
	priority: number;
	damage_class: { name: string };
	type: { name: string };
	meta: MoveMeta | null;
	effect_entries: MoveEffectEntry[];
	effect_chance: number | null;
	flavor_text_entries: MoveFlavorText[];
	learned_by_pokemon: { name: string; url: string }[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Ability types
// ─────────────────────────────────────────────────────────────────────────────

export interface AbilityEffectEntry {
	effect: string;
	short_effect: string;
	language: { name: string };
}

export interface AbilityFlavorText {
	flavor_text: string;
	language: { name: string };
	version_group: { name: string };
}

export interface AbilityPokemon {
	is_hidden: boolean;
	slot: number;
	pokemon: { name: string; url: string };
}

export interface Ability {
	id: number;
	name: string;
	is_main_series: boolean;
	effect_entries: AbilityEffectEntry[];
	flavor_text_entries: AbilityFlavorText[];
	pokemon: AbilityPokemon[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Nature types
// ─────────────────────────────────────────────────────────────────────────────

export interface Nature {
	id: number;
	name: string;
	increased_stat: { name: string } | null;
	decreased_stat: { name: string } | null;
	likes_flavor: { name: string } | null;
	hates_flavor: { name: string } | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Encounter types
// ─────────────────────────────────────────────────────────────────────────────

export interface EncounterDetail {
	chance: number;
	min_level: number;
	max_level: number;
	method: { name: string; url: string };
}

export interface EncounterVersionDetail {
	max_chance: number;
	version: { name: string; url: string };
	encounter_details: EncounterDetail[];
}

export interface EncounterArea {
	location_area: { name: string; url: string };
	version_details: EncounterVersionDetail[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Machine types (TM / HM / TR)
// ─────────────────────────────────────────────────────────────────────────────

export interface Machine {
	id: number;
	item: { name: string; url: string };
	move: { name: string; url: string };
	version_group: { name: string; url: string };
}
