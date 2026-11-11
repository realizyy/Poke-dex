import { expect, test } from '@playwright/test';

test('card search keeps category and sort choices in the URL and the form', async ({ page }) => {
	await page.goto('/tcg/cards?category=Trainer&sort=name&order=DESC');
	await expect(page.getByLabel('Category')).toHaveValue('Trainer');
	await expect(page.getByLabel('Sort by')).toHaveValue('name');
	await expect(page.getByLabel('Sort order')).toHaveValue('DESC');
	await expect(page.locator('a[href^="/tcg/cards/"]').first()).toBeVisible({ timeout: 30000 });
});

test('pagination only offers a next page when one exists', async ({ page }) => {
	await page.goto('/tcg/cards?q=pikachu');
	const next = page.getByRole('button', { name: /next/i }).last();
	await expect(next).toBeEnabled({ timeout: 30000 });
	await next.click();
	await expect(page).toHaveURL(/page=2/);
	await expect(page.getByText('Page 2').first()).toBeVisible();

	await page.goto('/tcg/cards?q=zzzznotacard');
	await expect(page.getByText('No cards found.')).toBeVisible();
});

test('a card page shows market prices and links to the right Pokédex entry', async ({ page }) => {
	await page.goto('/tcg/cards/swsh3-136');
	await expect(page.getByRole('heading', { name: 'Furret' })).toBeVisible();
	await expect(page.getByText('Market prices')).toBeVisible();
	await expect(page.getByText('Cardmarket')).toBeVisible();
	await page.getByRole('link', { name: /view #162 in the pokédex/i }).click();
	await expect(page).toHaveURL(/\/pokemon\/162/);
	await expect(page.getByRole('heading', { name: /furret/i }).first()).toBeVisible();
});

test('the TCG index links to every tool', async ({ page }) => {
	await page.goto('/tcg');
	const tools = page.getByRole('navigation', { name: 'TCG tools' });
	await expect(tools.getByRole('link', { name: 'Search cards' })).toBeVisible();
	await tools.getByRole('link', { name: 'My collection' }).click();
	await expect(page).toHaveURL(/\/tcg\/collection/);
});

test('owning and wishlisting a card shows up in the collection and the set progress', async ({
	page
}) => {
	await page.goto('/tcg/cards/swsh3-136');
	await page.getByRole('button', { name: 'Add one copy' }).click();
	await page.getByRole('button', { name: 'Add one copy' }).click();
	await page.getByRole('button', { name: 'Add to wishlist' }).click();
	await expect(page.getByRole('button', { name: 'On wishlist' })).toBeVisible();

	await page.reload();
	await expect(page.getByRole('group', { name: 'Owned' })).toContainText('2');
	await expect(page.getByRole('button', { name: 'On wishlist' })).toBeVisible();

	await page.goto('/tcg/collection');
	await expect(page.getByRole('link', { name: 'Furret' })).toBeVisible();
	await expect(page.getByText('×2')).toBeVisible();
	await page.getByRole('button', { name: 'Wishlist', exact: true }).click();
	await expect(page.getByRole('link', { name: 'Furret' })).toBeVisible();

	await page.goto('/tcg/sets/swsh3');
	await expect(page.getByText(/Collection: 1 \//)).toBeVisible({ timeout: 30000 });
	await page.getByRole('button', { name: 'Owned', exact: true }).click();
	await expect(page.getByText(/1 of \d+ cards/)).toBeVisible();
});

test('an exported collection can be imported again', async ({ page }) => {
	await page.goto('/tcg/cards/swsh3-136');
	await page.getByRole('button', { name: 'Add one copy' }).click();
	await page.goto('/tcg/collection');
	const [download] = await Promise.all([
		page.waitForEvent('download'),
		page.getByRole('button', { name: 'Export' }).click()
	]);
	const path = await download.path();

	await page.evaluate(() => localStorage.clear());
	await page.reload();
	await expect(page.getByText('You have not added any cards yet.')).toBeVisible();
	await page.locator('input[type="file"]').setInputFiles(path);
	await expect(page.getByRole('link', { name: 'Furret' })).toBeVisible();
});

test('building a deck: search, add, validate, and keep it after a reload', async ({ page }) => {
	await page.goto('/tcg/decks');
	await page.getByLabel('Deck name').fill('Thunder test');
	await page.getByRole('button', { name: 'New deck' }).click();
	await expect(page).toHaveURL(/\/tcg\/decks\/[0-9a-f-]+/);

	await page.getByLabel('Card name').fill('Pikachu');
	await page.getByLabel('Card name').press('Enter');
	const firstAdd = page.getByRole('button', { name: /^Add .* to the deck$/ }).first();
	await expect(firstAdd).toBeVisible({ timeout: 30000 });
	await firstAdd.click();
	await expect(page.getByLabel('Cards in deck')).toHaveText('1 / 60', { timeout: 30000 });
	await expect(page.getByText('Add 59 more cards')).toBeVisible();

	await page.getByLabel('Format').selectOption('expanded');
	await page.reload();
	await expect(page.getByLabel('Cards in deck')).toHaveText('1 / 60');
	await expect(page.getByLabel('Format')).toHaveValue('expanded');
	await expect(page.getByLabel('Deck name')).toHaveValue('Thunder test');

	await page.goto('/tcg/decks');
	await expect(page.getByRole('link', { name: 'Thunder test' })).toBeVisible();
});

test('a deck refuses a fifth copy of the same card', async ({ page }) => {
	await page.goto('/tcg/decks');
	await page.getByLabel('Deck name').fill('Copy limit');
	await page.getByRole('button', { name: 'New deck' }).click();
	await expect(page).toHaveURL(/\/tcg\/decks\/[0-9a-f-]+/);

	await page.goto('/tcg/cards/swsh3-136');
	for (let i = 0; i < 5; i++) {
		await page.getByRole('button', { name: 'Add to deck' }).click();
	}
	await expect(page.getByText(/already has 4 copies of Furret/).first()).toBeVisible();

	await page.goto('/tcg/decks');
	await page.getByRole('link', { name: 'Copy limit' }).click();
	await expect(page.getByLabel('Cards in deck')).toHaveText('4 / 60');
});

test('a missing deck explains itself', async ({ page }) => {
	await page.goto('/tcg/decks/does-not-exist');
	await expect(page.getByRole('heading', { name: 'Deck not found' })).toBeVisible();
});
