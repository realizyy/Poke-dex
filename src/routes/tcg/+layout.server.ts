import type { LayoutServerLoad } from './$types';
import { TCG_LANG_COOKIE, parseTcgLang } from '#lib/utils/tcg-lang';

export const load: LayoutServerLoad = ({ cookies }) => ({
	lang: parseTcgLang(cookies.get(TCG_LANG_COOKIE))
});
