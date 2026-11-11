import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// '/' shows 8 random Pokémon per load, so its count varies between runs.
const CONTRAST_BUDGET: Record<string, number> = {
	'/': 40,
	'/search': 10,
	'/pokemon/pikachu': 8,
	'/teams': 0,
	'/compare': 3,
	'/battle': 0,
	'/natures': 11,
	'/items': 1,
	'/tcg': 0,
	'/tcg/cards': 0,
	'/tcg/collection': 0,
	'/tcg/decks': 0,
	'/tcg/sets/swsh3': 0,
	'/tcg/cards/swsh3-136': 1
};

for (const [path, contrastBudget] of Object.entries(CONTRAST_BUDGET)) {
	test(`accessibility on ${path}`, async ({ page }) => {
		await page.goto(path);
		await page.waitForLoadState('networkidle');
		const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();

		const blocking = violations.filter((v) => v.id !== 'color-contrast');
		expect(blocking.map((v) => `${v.impact} ${v.id}`)).toEqual([]);

		const contrastNodes = violations.find((v) => v.id === 'color-contrast')?.nodes.length ?? 0;
		expect(contrastNodes).toBeLessThanOrEqual(contrastBudget);
	});
}
