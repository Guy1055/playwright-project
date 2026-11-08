import { test, expect } from '../fixtures/test';
import { ProductPage } from '../pages/ProductPage';
import { HomePage } from '../pages/HomePage';
import { ComparisonPage } from '../pages/ComparisonPage';

test.describe('Product page', () => {
  test('PRD-02: quantity buttons change the value and stop at 1', async ({ page, api }) => {
    const { id } = await api.inStockProduct();
    const product = new ProductPage(page);
    await product.goto(id);
    await expect(product.quantity).toHaveValue('1');

    await product.increaseQuantity.click();
    await expect(product.quantity).toHaveValue('2');
    await product.decreaseQuantity.click();
    await expect(product.quantity).toHaveValue('1');
    await product.decreaseQuantity.click();
    await expect(product.quantity).toHaveValue('1');
  });

  test('PRD-03: the chosen quantity is added to the cart', async ({ page, api }) => {
    const { id } = await api.inStockProduct();
    const product = new ProductPage(page);
    await product.goto(id);

    await product.quantity.fill('3');
    await product.addToCart();

    await expect(product.cartBadge).toHaveText('3');
  });

  test('PRD-04: related products are shown and open', async ({ page, api }) => {
    const { id, name } = await api.inStockProduct();
    const product = new ProductPage(page);
    await product.goto(id);
    await expect(product.name).toHaveText(name);
    await expect(product.relatedProducts.first()).toBeVisible();

    await product.relatedProducts.first().click();

    await expect(page).not.toHaveURL(new RegExp(id));
    await expect(product.name).not.toHaveText(name);
  });

  test('PRD-05: specifications match the API', async ({ page, api }) => {
    const { id } = await api.inStockProduct();
    const specs = await (await api.get(`/products/${id}/specs`)).json();
    test.skip(specs.length === 0, 'This product has no specifications');
    const product = new ProductPage(page);

    await product.goto(id);

    await expect(product.specRows).toHaveCount(specs.length);
  });

  test('PRD-06: a guest cannot add a favorite', async ({ page, api }) => {
    const { id } = await api.inStockProduct();
    const product = new ProductPage(page);
    await product.goto(id);

    await product.addToFavorites.click();

    await expect(product.toast).toContainText('Unauthorized');
  });

  test('PRD-07: a logged-in customer can add a favorite once', async ({ customerPage, api }) => {
    const { id } = await api.inStockProduct();
    const product = new ProductPage(customerPage);
    await product.goto(id);

    await product.addToFavorites.click();
    await expect(product.toast.filter({ hasText: 'added to your favorites' })).toBeVisible();

    await product.addToFavorites.click();
    await expect(product.toast.filter({ hasText: 'already' })).toBeVisible();
  });
});

test.describe('Product comparison', () => {
  async function selectTwoProducts(home: HomePage) {
    await home.goto();
    await expect(home.productNames.first()).toBeVisible();
    await home.compareButtons.nth(0).click();
    await home.compareButtons.nth(1).click();
    await expect(home.comparisonBar).toContainText('2 product(s) selected');
  }

  test('CMP-01: two selected products appear side by side', async ({ page }) => {
    const home = new HomePage(page);
    const comparison = new ComparisonPage(page);
    await selectTwoProducts(home);

    await home.compareLink.click();

    await expect(page).toHaveURL(/\/comparison$/);
    await expect(comparison.removeButtons).toHaveCount(2);
    await expect(comparison.table).toContainText('Price');
  });

  test('CMP-02: removing a product updates the comparison', async ({ page }) => {
    const home = new HomePage(page);
    const comparison = new ComparisonPage(page);
    await selectTwoProducts(home);
    await home.compareLink.click();
    await expect(comparison.removeButtons).toHaveCount(2);

    await comparison.removeButtons.first().click();

    await expect(comparison.removeButtons).toHaveCount(1);
  });

  test('CMP-03: clear all removes the comparison bar', async ({ page }) => {
    const home = new HomePage(page);
    await selectTwoProducts(home);

    await home.clearComparison.click();

    await expect(home.comparisonBar).toBeHidden();
  });

  test('CMP-04: the comparison page explains when it is empty', async ({ page }) => {
    const comparison = new ComparisonPage(page);

    await page.goto('/comparison');

    await expect(comparison.empty).toBeVisible();
  });
});
