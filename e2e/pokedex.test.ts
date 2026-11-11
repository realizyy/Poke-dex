import { expect, test } from '@playwright/test';

test('home page shows the hero heading', async ({ page }) => {
	await page.goto('/');
	await expect(page.locator('h1')).toBeVisible();
});

test('pokemon detail page renders pikachu', async ({ page }) => {
	await page.goto('/pokemon/pikachu');
	await expect(page.getByRole('heading', { name: /pikachu/i }).first()).toBeVisible();
});

test('search page loads', async ({ page }) => {
	await page.goto('/search');
	await expect(page).toHaveURL(/\/search/);
	await expect(page.locator('body')).toContainText(/search/i);
});
