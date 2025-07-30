import { writable } from 'svelte/store';
import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

// Get initial theme from localStorage or default to system
function getInitialTheme(): Theme {
	if (!browser) return 'system';
	
	const stored = localStorage.getItem('theme') as Theme;
	if (stored && ['light', 'dark', 'system'].includes(stored)) {
		return stored;
	}
	return 'system';
}

// Get actual theme based on system preference
function getActualTheme(theme: Theme): 'light' | 'dark' {
	if (theme === 'system') {
		if (!browser) return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return theme;
}

export const theme = writable<Theme>(getInitialTheme());
export const actualTheme = writable<'light' | 'dark'>('light');

// Apply theme to document
function applyTheme(actualTheme: 'light' | 'dark') {
	if (!browser) return;
	
	const root = document.documentElement;
	
	if (actualTheme === 'dark') {
		root.classList.add('dark');
	} else {
		root.classList.remove('dark');
	}
}

// Subscribe to theme changes
theme.subscribe((currentTheme) => {
	if (!browser) return;
	
	localStorage.setItem('theme', currentTheme);
	const actual = getActualTheme(currentTheme);
	actualTheme.set(actual);
	applyTheme(actual);
});

// Listen for system theme changes
if (browser) {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	mediaQuery.addEventListener('change', (e) => {
		theme.update((currentTheme) => {
			if (currentTheme === 'system') {
				const actual = e.matches ? 'dark' : 'light';
				actualTheme.set(actual);
				applyTheme(actual);
			}
			return currentTheme;
		});
	});
	
	// Apply initial theme
	const initial = getInitialTheme();
	const actual = getActualTheme(initial);
	actualTheme.set(actual);
	applyTheme(actual);
}

export function toggleTheme() {
	theme.update((currentTheme) => {
		if (currentTheme === 'light') return 'dark';
		if (currentTheme === 'dark') return 'system';
		return 'light';
	});
}

export function setTheme(newTheme: Theme) {
	theme.set(newTheme);
}