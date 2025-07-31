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

// Create stores
const initialTheme = getInitialTheme();
export const theme = writable<Theme>(initialTheme);
export const actualTheme = writable<'light' | 'dark'>(getActualTheme(initialTheme));

// Apply theme to document
function applyTheme(actualTheme: 'light' | 'dark') {
	if (!browser) return;
	
	const root = document.documentElement;
	
	console.log('🎨 Applying theme:', actualTheme); // Debug log
	
	if (actualTheme === 'dark') {
		root.classList.add('dark');
		console.log('🌙 Added dark class to html element'); // Debug log
	} else {
		root.classList.remove('dark');
		console.log('☀️ Removed dark class from html element'); // Debug log
	}
	
	// Force CSS variable recalculation and log current values
	setTimeout(() => {
		const computedStyle = getComputedStyle(root);
		const bgMain = computedStyle.getPropertyValue('--bg-main').trim();
		const textMain = computedStyle.getPropertyValue('--text-main').trim();
		
		console.log('📝 HTML classes:', root.className);
		console.log('� CSS Variables after theme change:');
		console.log('  --bg-main:', bgMain || 'undefined');
		console.log('  --text-main:', textMain || 'undefined');
	}, 10);
	
	// Force a repaint to ensure CSS variables take effect
	root.style.display = 'none';
	root.offsetHeight; // Trigger reflow
	root.style.display = '';
}

// Subscribe to theme changes
theme.subscribe((currentTheme) => {
	if (!browser) return;
	
	localStorage.setItem('theme', currentTheme);
	const actual = getActualTheme(currentTheme);
	actualTheme.set(actual);
	applyTheme(actual);
});

// Listen for system theme changes and apply initial theme
if (browser) {
	const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
	
	// Apply initial theme immediately
	const initial = getInitialTheme();
	const actualInitial = getActualTheme(initial);
	actualTheme.set(actualInitial);
	applyTheme(actualInitial);
	
	// Also listen for changes to system preference
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
}

export function toggleTheme() {
	theme.update((currentTheme) => {
		if (currentTheme === 'light') return 'dark';
		if (currentTheme === 'dark') return 'system';
		return 'light'; // system -> light
	});
}

export function setTheme(newTheme: Theme) {
	theme.set(newTheme);
}