import { expect, test } from '@playwright/test';

test('home page shows the hero heading', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});

test('pokemon detail page renders pikachu', async ({ page }) => {
	await page.goto('/pokemon/pikachu');
	await expect(page.getByRole('heading', { name: /pikachu/i }).first()).toBeVisible();
});

test('search finds a pokemon by name and opens its page', async ({ page }) => {
	await page.goto('/search');
	await page.getByPlaceholder(/search by name/i).fill('pikachu');
	await page.getByPlaceholder(/search by name/i).press('Enter');
	const result = page.getByText(/^pikachu$/i).first();
	await expect(result).toBeVisible({ timeout: 30000 });
	await result.click();
	await expect(page).toHaveURL(/\/pokemon\/pikachu/);
});

test('a created team survives a reload', async ({ page }) => {
	await page.goto('/teams');
	await page.getByRole('button', { name: '+ New' }).click();
	await page.getByPlaceholder('Enter team name...').fill('Elite Four');
	await page.getByRole('button', { name: 'Create Team' }).click();
	await expect(page.getByText('Elite Four').first()).toBeVisible();
	await page.reload();
	await expect(page.getByText('Elite Four').first()).toBeVisible();
});

test('compare shows both pokemon from the URL', async ({ page }) => {
	await page.goto('/compare?a=pikachu&b=bulbasaur');
	await expect(page.getByText(/pikachu/i).first()).toBeVisible({ timeout: 30000 });
	await expect(page.getByText(/bulbasaur/i).first()).toBeVisible({ timeout: 30000 });
});

test('an unknown pokemon does not crash the page', async ({ page }) => {
	const errors: string[] = [];
	page.on('pageerror', (e) => errors.push(e.message));
	await page.goto('/pokemon/notapokemon');
	await expect(page.locator('body')).toBeVisible();
	expect(errors).toEqual([]);
});

test('following an evolution link updates the pokemon page', async ({ page }) => {
	await page.goto('/pokemon/pikachu');
	await expect(page.getByRole('heading', { name: /pikachu/i }).first()).toBeVisible();
	await page
		.getByRole('button', { name: /evolution/i })
		.first()
		.click();
	await page
		.getByRole('button', { name: /raichu/i })
		.first()
		.click();
	await expect(page).toHaveURL(/\/pokemon\/raichu/);
	await expect(page.getByRole('heading', { name: /raichu/i }).first()).toBeVisible();
	await expect(page.getByRole('heading', { name: /^pikachu$/i })).toHaveCount(0);
});
