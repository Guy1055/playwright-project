import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Catalog category filter', () => {
  test('filtering by a category narrows the list and clearing restores it', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.productNames.first()).toBeVisible();
    const unfilteredCount = await home.productNames.count();

    await home.filterByCategory('Hammer');
    await expect(home.categoryCheckbox('Hammer')).toBeChecked();

    // Every listed product belongs to the Hammer category (all names contain "hammer").
    await expect
      .poll(async () => (await home.listedNames()).every((n) => /hammer/i.test(n)))
      .toBe(true);
    await expect.poll(() => home.productNames.count()).toBeLessThan(unfilteredCount);
    await expect(home.productNames.first()).toBeVisible();

    await home.clearCategory('Hammer');
    await expect(home.productNames).toHaveCount(unfilteredCount);
  });

  test('selecting two categories shows products from both', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.filterByCategory('Hand Saw');
    await expect.poll(async () => (await home.listedNames()).length).toBeGreaterThan(0);
    const sawOnly = await home.listedNames();

    await home.filterByCategory('Hammer');
    await expect
      .poll(async () => (await home.listedNames()).some((n) => /hammer/i.test(n)))
      .toBe(true);
    const names = await home.listedNames();
    for (const saw of sawOnly) expect(names).toContain(saw);
  });
});
