export const TCG_LANGUAGES = [
	{ id: 'en', label: 'English' },
	{ id: 'fr', label: 'Français' },
	{ id: 'de', label: 'Deutsch' },
	{ id: 'es', label: 'Español' },
	{ id: 'it', label: 'Italiano' },
	{ id: 'pt', label: 'Português' }
] as const;

export type TcgLang = (typeof TCG_LANGUAGES)[number]['id'];

export const DEFAULT_TCG_LANG: TcgLang = 'en';
export const TCG_LANG_COOKIE = 'tcg-lang';
const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export function parseTcgLang(value: string | null | undefined): TcgLang {
	return TCG_LANGUAGES.find((l) => l.id === value)?.id ?? DEFAULT_TCG_LANG;
}

/** Category, stage, rarity and type values are translated by the API, so only English filters can be sent. */
export function supportsValueFilters(lang: TcgLang): boolean {
	return lang === 'en';
}

export function langCookie(lang: TcgLang): string {
	return `${TCG_LANG_COOKIE}=${lang}; path=/; max-age=${ONE_YEAR_SECONDS}; samesite=lax`;
}
