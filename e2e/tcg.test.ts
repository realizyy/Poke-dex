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
