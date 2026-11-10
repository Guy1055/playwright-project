import { test, expect } from '../../fixtures/test';
import { NavBar } from '../../pages/NavBar';

test.describe('Admin navigation', () => {
  for (const { testId, path } of [
    { testId: 'nav-admin-dashboard', path: '/admin/dashboard' },
    { testId: 'nav-admin-brands', path: '/admin/brands' },
    { testId: 'nav-admin-categories', path: '/admin/categories' },
    { testId: 'nav-admin-products', path: '/admin/products' },
    { testId: 'nav-admin-orders', path: '/admin/orders' },
    { testId: 'nav-admin-users', path: '/admin/users' },
    { testId: 'nav-admin-messages', path: '/admin/messages' },
    { testId: 'nav-admin-settings', path: '/admin/settings' },
  ]) {
    test(`ADM-01: the admin menu opens ${path}`, async ({ adminPage }) => {
      const nav = new NavBar(adminPage);
      await adminPage.goto('/admin/dashboard');

      await nav.openUserMenuItem(testId);

      await expect(adminPage).toHaveURL(new RegExp(`${path}$`));
      await expect(adminPage.getByTestId('page-title')).toBeVisible();
    });
  }

  for (const { testId, path } of [
    { testId: 'nav-admin-statistics', path: '/admin/reports/statistics' },
    { testId: 'nav-average-month-sales', path: '/admin/reports/average-sales-per-month' },
    { testId: 'nav-average-week-sales', path: '/admin/reports/average-sales-per-week' },
  ]) {
    test(`ADM-01b: the reports menu opens ${path}`, async ({ adminPage }) => {
      const nav = new NavBar(adminPage);
      await adminPage.goto('/admin/dashboard');

      await nav.openReport(testId);

      await expect(adminPage).toHaveURL(new RegExp(`${path}$`));
      await expect(adminPage.getByTestId('page-title')).toBeVisible();
    });
  }

  for (const path of ['/admin/dashboard', '/admin/brands', '/admin/products', '/admin/users', '/admin/orders']) {
    test(`ADM-02: a guest opening ${path} is sent away`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }
});

test.describe('Admin dashboard and reports', () => {
  test('ADM-03: the dashboard shows the sales chart and latest orders', async ({ adminPage }) => {
    await adminPage.goto('/admin/dashboard');

    await expect(adminPage.getByTestId('page-title')).toHaveText('Sales over the years');
    await expect(adminPage.locator('canvas')).toBeVisible();
    await expect(adminPage.getByRole('heading', { name: 'Latest orders' })).toBeVisible();
  });

  test('ADM-04: the statistics report renders its charts', async ({ adminPage }) => {
    await adminPage.goto('/admin/reports/statistics');

    await expect(adminPage.getByTestId('page-title')).toHaveText('Statistics');
    await expect(adminPage.getByRole('heading', { name: 'Top 10 Best Selling Categories' })).toBeVisible();
    await expect(adminPage.getByRole('table').first()).toBeVisible();
  });

  for (const report of ['average-sales-per-month', 'average-sales-per-week']) {
    test(`ADM-05: the ${report} report has a year selector`, async ({ adminPage }) => {
      await adminPage.goto(`/admin/reports/${report}`);

      await expect(adminPage.getByTestId('year')).toBeVisible();
      await expect(adminPage.locator('canvas').first()).toBeVisible();
    });
  }

  test('ADM-06: the settings page opens', async ({ adminPage }) => {
    await adminPage.goto('/admin/settings');

    await expect(adminPage.getByTestId('page-title')).toBeVisible();
    await expect(adminPage.getByTestId('settings-submit')).toBeVisible();
  });
});
