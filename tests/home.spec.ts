import { test, expect } from '@playwright/test';

test.describe('Home page', () => {
  test('shows the product catalog', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Toolshop/);
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
    await expect(page.getByTestId('product-name').first()).toBeVisible();
  });

  test('searching narrows the product list', async ({ page }) => {
    await page.goto('/');

    await page.getByTestId('search-query').fill('hammer');
    await page.getByTestId('search-submit').click();

    const names = page.getByTestId('product-name');
    await expect(names.first()).toContainText(/hammer/i);
  });
});
