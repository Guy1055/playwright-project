import { test, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';
import { NavBar } from '../pages/NavBar';
import { ProductPage } from '../pages/ProductPage';
import { HOME_URL } from '../support/env';

test.describe('Catalog', () => {
  test('CAT-03: a search with no matches shows the empty state', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.search('zzzz-no-such-product');

    await expect(home.noResults).toHaveText('There are no products found.');
    await expect(home.productNames).toHaveCount(0);
    await expect(home.searchCaption).toContainText('zzzz-no-such-product');
  });

  for (const term of ['pliers', 'saw', 'hammer']) {
    test(`CAT-08: search for "${term}" lists only matching products`, async ({ page }) => {
      const home = new HomePage(page);
      await home.goto();

      await home.search(term);

      await expect(home.productNames.first()).toBeVisible();
      for (const name of await home.listedNames()) {
        expect(name.toLowerCase()).toContain(term);
      }
    });
  }

  test('CAT-09: resetting the search restores the catalog', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.productNames.first()).toBeVisible();
    const original = await home.listedNames();
    await home.search('hammer');
    await expect(home.searchCaption).toBeVisible();

    await home.searchReset.click();

    await expect(home.searchCaption).toBeHidden();
    await expect(home.searchInput).toHaveValue('');
    await expect(home.productNames).toHaveText(original.map((n) => new RegExp(escapeRegExp(n))));
  });

  for (const { sort, label } of [
    { sort: 'price,asc', label: 'price low to high' },
    { sort: 'price,desc', label: 'price high to low' },
    { sort: 'name,asc', label: 'name A to Z' },
    { sort: 'name,desc', label: 'name Z to A' },
  ]) {
    test(`CAT-04: sorting by ${label} matches the API order`, async ({ page, api }) => {
      // The grid applies its default 1-100 price range, so the API call must too.
      const response = await api.get('/products', { params: { sort, page: 1, between: 'price,1,100' } });
      const expected: string[] = (await response.json()).data.map((p: { name: string }) => p.name);
      const home = new HomePage(page);
      await home.goto();
      await expect(home.productNames.first()).toBeVisible();

      await home.sortBy(sort);

      await expect.poll(() => home.listedNames()).toEqual(expected);
    });
  }

  test('CAT-05b: filtering by brand lists only that brand', async ({ page, api }) => {
    const product = await api.inStockProduct();
    const response = await api.get('/products', {
      params: { by_brand: product.brand.id, page: 1, between: 'price,1,100' },
    });
    const expected: string[] = (await response.json()).data.map((p: { name: string }) => p.name);
    const home = new HomePage(page);
    await home.goto();
    await expect(home.productNames.first()).toBeVisible();

    await home.categoryCheckbox(product.brand.name).check();
    await home.waitFor('filter_completed');

    await expect.poll(() => home.listedNames()).toEqual(expected);
  });

  test('CAT-10: the eco filter shows only eco-friendly products', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.productNames.first()).toBeVisible();

    await home.whileCatalogReloads(() => home.ecoFilter.check());

    await expect(home.productNames.first()).toBeVisible();
    await expect(page.getByTestId('eco-badge')).toHaveCount(await home.productNames.count());
  });

  test('CAT-11: lowering the maximum price removes more expensive products', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.productNames.first()).toBeVisible();

    await home.priceMaxSlider.focus();
    await home.whileCatalogReloads(() => home.priceMaxSlider.press('PageDown'));
    const max = Number(await home.priceMaxSlider.getAttribute('aria-valuenow'));
    expect(max).toBeLessThan(100);

    await expect
      .poll(async () => (await home.prices()).every((price) => price <= max))
      .toBe(true);
  });

  test('CAT-06: the next page shows different products', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();
    await expect(home.productNames.first()).toBeVisible();
    const firstPage = await home.listedNames();

    await home.goToNextPage();

    await expect.poll(() => home.listedNames()).not.toEqual(firstPage);
    expect(await home.listedNames()).toHaveLength(9);
  });

  test('CAT-07: an out-of-stock product cannot be added to the cart', async ({ page, api }) => {
    const outOfStock = await api.outOfStockProduct();
    test.skip(!outOfStock, 'The shared demo currently has no out-of-stock product');
    const product = new ProductPage(page);

    await product.goto(outOfStock!.id);

    await expect(page.getByTestId('out-of-stock')).toBeVisible();
    await expect(product.addToCartButton).toBeDisabled();
  });

  test('RNT-01: the rentals page lists rental products', async ({ page }) => {
    await page.goto('/rentals');

    await expect(page.getByTestId('page-title')).toHaveText('Rentals');
    await expect(page.locator('[data-test^="product-"]').first()).toBeVisible();
    expect(await page.locator('[data-test^="product-"]').count()).toBeGreaterThan(0);
  });

  test('PRV-01: the privacy policy page opens', async ({ page }) => {
    await page.goto('/privacy');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy');
  });
});

test.describe('Navigation', () => {
  for (const { testId, path, title } of [
    { testId: 'nav-hand-tools', path: '/category/hand-tools', title: 'Hand Tools' },
    { testId: 'nav-power-tools', path: '/category/power-tools', title: 'Power Tools' },
    { testId: 'nav-other', path: '/category/other', title: 'Other' },
    { testId: 'nav-special-tools', path: '/category/special-tools', title: 'Special Tools' },
  ]) {
    test(`NAV-01: the menu opens the ${title} category`, async ({ page }) => {
      const nav = new NavBar(page);
      await page.goto('/');

      await nav.openCategory(testId);

      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByTestId('page-title')).toContainText(title);
    });
  }

  test('NAV-02: the top links open their pages', async ({ page }) => {
    const nav = new NavBar(page);
    await page.goto('/');

    await nav.contact.click();
    await expect(page).toHaveURL(/\/contact$/);
    await nav.openCategory('nav-rentals');
    await expect(page).toHaveURL(/\/rentals$/);
    await nav.signIn.click();
    await expect(page).toHaveURL(/\/auth\/login$/);
    await nav.home.click();
    await expect(page).toHaveURL(HOME_URL);
  });
});

function escapeRegExp(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
