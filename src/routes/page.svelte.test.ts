import { describe, test, expect, vi } from 'vitest';
import { readable } from 'svelte/store';
import { render, screen } from '@testing-library/svelte';

vi.mock('$app/stores', () => ({
	page: readable({ data: { pokemons: [], featuredSets: [] } })
}));
vi.mock('$app/navigation', () => ({ goto: vi.fn() }));

import Page from './+page.svelte';

describe('/+page.svelte', () => {
	test('renders the hero heading', () => {
		render(Page);
		expect(screen.getByRole('heading', { level: 1 })).toBeInTheDocument();
	});
});
