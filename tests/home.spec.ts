import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Home page', { tag: '@sanity' }, () => {
  test('shows the product catalog', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await expect(page).toHaveTitle(/Toolshop/);
    await expect(page.getByTestId('nav-sign-in')).toBeVisible();
    await expect(home.productNames.first()).toBeVisible();
  });

  test('searching narrows the product list', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.search('hammer');

    await expect(home.productNames.first()).toContainText(/hammer/i);
  });
});
