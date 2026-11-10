import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { parsePrice } from '../support/testData';

test.describe('Product page and cart', { tag: '@sanity' }, () => {
  test('product page shows name, price and description', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    await home.goto();

    const name = await home.openFirstInStockProduct();

    await expect(product.name).toHaveText(name);
    await expect(product.unitPrice).toContainText(/\d+\.\d{2}/);
    await expect(product.description).toBeVisible();
  });

  test('adding a product shows a toast and sets the cart badge to 1', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    await home.goto();
    await home.openFirstInStockProduct();

    await product.addToCart();

    await expect(product.toast).toContainText('Product added to shopping cart');
    await expect(product.cartBadge).toHaveText('1');
  });

  test('cart total equals unit price times quantity', async ({ page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    await home.goto();
    const name = await home.openFirstInStockProduct();
    await expect(product.unitPrice).toContainText(/\d/);
    const unitPrice = parsePrice(await product.unitPrice.innerText());

    await product.increaseQuantity.click();
    await expect(product.quantity).toHaveValue('2');
    await product.addToCart();
    await expect(product.cartBadge).toHaveText('2');
    await cart.open();

    await expect(cart.itemTitles.first()).toContainText(name);
    await expect(cart.total).toContainText((unitPrice * 2).toFixed(2));
  });
});
