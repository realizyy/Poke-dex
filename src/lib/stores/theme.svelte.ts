import { browser } from '$app/environment';

type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Theme {
	if (!browser) return 'system';
	const stored = localStorage.getItem('theme') as Theme;
	if (stored && ['light', 'dark', 'system'].includes(stored)) return stored;
	return 'system';
}

function resolveActual(theme: Theme): 'light' | 'dark' {
	if (theme === 'system') {
		if (!browser) return 'light';
		return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
	}
	return theme;
}

class ThemeStore {
	theme: Theme = $state(getInitialTheme());
	actual: 'light' | 'dark' = $derived(resolveActual(this.theme));

	constructor() {
		if (browser) {
			// Apply on first load
			this.#apply(resolveActual(this.theme));

			// Listen for system preference changes
			window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
				if (this.theme === 'system') {
					this.#apply(e.matches ? 'dark' : 'light');
				}
			});
		}
	}

	#apply(actual: 'light' | 'dark') {
		if (!browser) return;
		const root = document.documentElement;
		if (actual === 'dark') {
			root.classList.add('dark');
			root.dataset.theme = 'pokedex-dark';
		} else {
			root.classList.remove('dark');
			root.dataset.theme = 'pokedex';
		}
		// Force repaint to ensure CSS vars take effect
		root.style.display = 'none';
		root.offsetHeight;
		root.style.display = '';
	}

	set(newTheme: Theme) {
		this.theme = newTheme;
		if (browser) {
			localStorage.setItem('theme', newTheme);
			this.#apply(resolveActual(newTheme));
		}
	}

	toggle() {
		const next = this.theme === 'light' ? 'dark' : 'light';
		this.set(next);
	}
}

export const themeStore = new ThemeStore();

// Backward-compatible named exports for legacy consumers
export const toggleTheme = () => themeStore.toggle();
export const setTheme = (t: Theme) => themeStore.set(t);
