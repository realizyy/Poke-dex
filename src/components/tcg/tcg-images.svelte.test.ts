import { describe, expect, it } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { fireEvent, render, screen } from '@testing-library/svelte';
import CardImage from './CardImage.svelte';
import SetCard from './SetCard.svelte';

const set = {
	id: 'swsh1',
	name: 'Sword & Shield',
	logo: 'https://assets.tcgdex.net/en/swsh/swsh1/logo',
	symbol: 'https://assets.tcgdex.net/univ/swsh/swsh1/symbol',
	cardCount: { total: 216, official: 202 }
};

describe('SetCard artwork', () => {
	it('loads the logo with the .webp extension', () => {
		render(SetCard, { set });
		expect(screen.getByRole('img', { name: 'Sword & Shield' })).toHaveAttribute(
			'src',
			'https://assets.tcgdex.net/en/swsh/swsh1/logo.webp'
		);
	});

	it('falls back to the symbol, then to the set initials', async () => {
		render(SetCard, { set });
		await fireEvent.error(screen.getByRole('img', { name: 'Sword & Shield' }));
		expect(screen.getByRole('img', { name: 'Sword & Shield' })).toHaveAttribute(
			'src',
			'https://assets.tcgdex.net/univ/swsh/swsh1/symbol'
		);
		await fireEvent.error(screen.getByRole('img', { name: 'Sword & Shield' }));
		expect(screen.queryByRole('img', { name: 'Sword & Shield' })).not.toBeInTheDocument();
		expect(screen.getByText('S&S')).toBeInTheDocument();
	});

	it('shows initials straight away for a set with no artwork', () => {
		render(SetCard, { set: { ...set, logo: undefined, symbol: undefined, name: 'Delta Reign' } });
		expect(screen.getByText('DR')).toBeInTheDocument();
	});

	it('shows the official and total counts when they differ', () => {
		render(SetCard, { set });
		expect(screen.getByText('202/216 cards')).toBeInTheDocument();
	});
});

describe('CardImage', () => {
	it('shows the card image', () => {
		render(CardImage, { image: 'https://assets.tcgdex.net/en/me/30th/004', alt: 'Illumise' });
		expect(screen.getByRole('img', { name: 'Illumise' })).toHaveAttribute(
			'src',
			'https://assets.tcgdex.net/en/me/30th/004/low.webp'
		);
	});

	it('swaps to a labelled placeholder when the image fails to load', async () => {
		render(CardImage, { image: 'https://assets.tcgdex.net/en/me/30th/B', alt: 'Mew' });
		await fireEvent.error(screen.getByRole('img', { name: 'Mew' }));
		expect(screen.getByRole('img', { name: 'Mew, no image available' })).toBeInTheDocument();
		expect(screen.getByText('No image')).toBeInTheDocument();
	});

	it('shows the placeholder when the card has no image at all', () => {
		render(CardImage, { alt: 'Mystery' });
		expect(screen.getByRole('img', { name: 'Mystery, no image available' })).toBeInTheDocument();
	});
});
