import type { Pokemon } from '#lib/types';

export type LearnMethod = 'level-up' | 'machine' | 'egg' | 'tutor' | 'other';

export interface LearnsetEntry {
	move: string;
	level: number;
}

export type Learnset = Record<LearnMethod, LearnsetEntry[]>;

export const LEARN_METHODS: { id: LearnMethod; label: string }[] = [
	{ id: 'level-up', label: 'Level up' },
	{ id: 'machine', label: 'TM / HM' },
	{ id: 'egg', label: 'Egg' },
	{ id: 'tutor', label: 'Tutor' },
	{ id: 'other', label: 'Other' }
];

const KNOWN_VERSION_GROUPS_NEWEST_FIRST = [
	'champions',
	'scarlet-violet',
	'legends-arceus',
	'brilliant-diamond-shining-pearl',
	'sword-shield',
	'lets-go-pikachu-lets-go-eevee',
	'ultra-sun-ultra-moon',
	'sun-moon',
	'omega-ruby-alpha-sapphire',
	'x-y',
	'black-2-white-2',
	'black-white',
	'heartgold-soulsilver',
	'platinum',
	'diamond-pearl',
	'xd',
	'colosseum',
	'emerald',
	'firered-leafgreen',
	'ruby-sapphire',
	'crystal',
	'gold-silver',
	'yellow',
	'red-blue',
	'blue-japan',
	'red-green-japan'
];

type PokemonMoves = Pick<Pokemon, 'moves'>['moves'];

function toMethod(name: string): LearnMethod {
	if (name === 'level-up' || name === 'machine' || name === 'egg' || name === 'tutor') return name;
	return 'other';
}

export function formatVersionGroup(name: string): string {
	return name
		.split('-')
		.map((part) => part.charAt(0).toUpperCase() + part.slice(1))
		.join(' ');
}

/** Groups this Pokemon has moves in, newest first. Unknown groups are assumed newer than known ones. */
export function getVersionGroups(moves: PokemonMoves): string[] {
	const present = new Set<string>();
	for (const move of moves) {
		for (const detail of move.version_group_details ?? []) present.add(detail.version_group.name);
	}
	const rank = (name: string) => {
		const index = KNOWN_VERSION_GROUPS_NEWEST_FIRST.indexOf(name);
		return index === -1 ? -1 : index;
	};
	return [...present].sort((a, b) => rank(a) - rank(b) || a.localeCompare(b));
}

/** The newest game where the Pokemon learns moves by level, so the first view is a useful one. */
export function getDefaultVersionGroup(moves: PokemonMoves): string {
	const groups = getVersionGroups(moves);
	const withLevelUp = groups.find((group) =>
		moves.some((move) =>
			(move.version_group_details ?? []).some(
				(d) => d.version_group.name === group && d.move_learn_method.name === 'level-up'
			)
		)
	);
	return withLevelUp ?? groups[0] ?? '';
}

export function buildLearnset(moves: PokemonMoves, versionGroup: string): Learnset {
	const learnset: Learnset = { 'level-up': [], machine: [], egg: [], tutor: [], other: [] };
	for (const move of moves) {
		for (const detail of move.version_group_details ?? []) {
			if (detail.version_group.name !== versionGroup) continue;
			const method = toMethod(detail.move_learn_method.name);
			const already = learnset[method].some(
				(entry) => entry.move === move.move.name && entry.level === detail.level_learned_at
			);
			if (!already) {
				learnset[method].push({ move: move.move.name, level: detail.level_learned_at });
			}
		}
	}
	learnset['level-up'].sort((a, b) => a.level - b.level || a.move.localeCompare(b.move));
	for (const method of ['machine', 'egg', 'tutor', 'other'] as const) {
		learnset[method].sort((a, b) => a.move.localeCompare(b.move));
	}
	return learnset;
}
