import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { render, screen } from '@testing-library/svelte';
import type { TcgCard } from '#lib/types';
import Page from './+page.svelte';

function card(overrides: Partial<TcgCard> = {}): TcgCard {
	return {
		category: 'Pokemon',
		id: 'test-1',
		localId: '1',
		name: 'Twin Energy Mon',
		image: 'https://assets.tcgdex.net/en/test/test/1',
		hp: 90,
		types: ['Psychic'],
		set: { id: 'test', name: 'Test Set', cardCount: { total: 10, official: 10 } },
		...overrides
	};
}

function renderCard(c: TcgCard) {
	return render(Page, { data: { card: c, lang: 'en' } as never });
}

describe('card detail page', () => {
	it('renders attacks whose energy costs repeat the same type', () => {
		renderCard(
			card({
				attacks: [
					{ name: 'Psybeam', cost: ['Psychic', 'Psychic', 'Colorless'], damage: 60 },
					{ name: 'Tackle', cost: ['Colorless', 'Colorless'], damage: 20 }
				]
			})
		);
		expect(screen.getByText('Psybeam')).toBeInTheDocument();
		expect(screen.getByText('Tackle')).toBeInTheDocument();
	});

	it('renders two attacks that share a name', () => {
		renderCard(
			card({
				attacks: [
					{ name: 'Gust', cost: ['Colorless'], damage: 10 },
					{ name: 'Gust', cost: ['Colorless', 'Colorless'], damage: 30 }
				]
			})
		);
		expect(screen.getAllByText('Gust')).toHaveLength(2);
	});

	it('renders repeated types, weaknesses and resistances', () => {
		renderCard(
			card({
				types: ['Psychic', 'Psychic'],
				weaknesses: [
					{ type: 'Darkness', value: '×2' },
					{ type: 'Darkness', value: '×2' }
				],
				resistances: [
					{ type: 'Fighting', value: '-30' },
					{ type: 'Fighting', value: '-30' }
				]
			})
		);
		expect(screen.getByRole('heading', { name: 'Twin Energy Mon' })).toBeInTheDocument();
	});

	it('shows a placeholder when the card has no image', () => {
		renderCard(card({ image: undefined }));
		expect(screen.getByRole('img', { name: /no image available/i })).toBeInTheDocument();
	});
});
