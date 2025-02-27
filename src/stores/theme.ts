import { writable } from 'svelte/store';

export const theme = writable('light');

export function toggleTheme() {
	theme.update(current => {
		const newTheme = current === 'light' ? 'dark' : 'light';
		document.documentElement.classList.toggle('dark', newTheme === 'dark');
		return newTheme;
	});
}