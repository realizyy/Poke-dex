import { describe, expect, it } from 'vitest';
import { langCookie, parseTcgLang, supportsValueFilters } from './tcg-lang';

describe('parseTcgLang', () => {
	it('accepts the supported languages', () => {
		expect(parseTcgLang('fr')).toBe('fr');
		expect(parseTcgLang('pt')).toBe('pt');
	});

	it('falls back to English for anything else', () => {
		expect(parseTcgLang('ja')).toBe('en');
		expect(parseTcgLang('')).toBe('en');
		expect(parseTcgLang(null)).toBe('en');
		expect(parseTcgLang(undefined)).toBe('en');
		expect(parseTcgLang('../../etc')).toBe('en');
	});
});

describe('supportsValueFilters', () => {
	it('only allows value filters in English', () => {
		expect(supportsValueFilters('en')).toBe(true);
		expect(supportsValueFilters('de')).toBe(false);
	});
});

describe('langCookie', () => {
	it('is site wide, lasts a year, and is lax', () => {
		expect(langCookie('es')).toBe('tcg-lang=es; path=/; max-age=31536000; samesite=lax');
	});
});
