import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import { makePokemon } from '$lib/testing/fixtures';
import PokemonCard from './PokemonCard.svelte';
import StatBar from './StatBar.svelte';
import TypeBadge from './TypeBadge.svelte';

describe('TypeBadge', () => {
	it('shows the type name with its color', () => {
		render(TypeBadge, { type: 'fire' });
		const badge = screen.getByText('fire');
		expect(badge).toBeInTheDocument();
		expect(badge).toHaveStyle({ backgroundColor: '#EE8130' });
	});
});

describe('StatBar', () => {
	it('shows the readable stat name and value', () => {
		render(StatBar, { name: 'special-attack', value: 120 });
		expect(screen.getByText('Sp. Attack')).toBeInTheDocument();
		expect(screen.getByText('120')).toBeInTheDocument();
	});

	it('caps the bar width at 100 percent', () => {
		const { container } = render(StatBar, { name: 'hp', value: 400, max: 255 });
		const fill = container.querySelector('.transition-all') as HTMLElement;
		expect(fill.style.width).toBe('100%');
	});
});

describe('PokemonCard', () => {
	it('shows the name, padded id and types', () => {
		render(PokemonCard, {
			pokemon: makePokemon({ id: 6, name: 'charizard', types: ['fire', 'flying'] })
		});
		expect(screen.getByText('charizard')).toBeInTheDocument();
		expect(screen.getByText('#006')).toBeInTheDocument();
		expect(screen.getByText('fire')).toBeInTheDocument();
		expect(screen.getByText('flying')).toBeInTheDocument();
	});
});
