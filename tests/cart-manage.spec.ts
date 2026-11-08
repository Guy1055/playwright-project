import { test, expect } from '../fixtures/test';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { parsePrice } from '../support/testData';

test.describe('Cart management', () => {
  async function cartWithOneProduct(page: import('@playwright/test').Page, id: string) {
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    await product.addProductToCart(id);
    await cart.open();
    await expect(cart.itemTitles).toHaveCount(1);
    return cart;
  }

  test('CRT-03: changing the quantity updates line price and total', async ({ page, api }) => {
    const { id, price } = await api.inStockProduct();
    const cart = await cartWithOneProduct(page, id);

    await cart.setQuantity(3);

    await expect(cart.toast.filter({ hasText: 'Product quantity updated' })).toBeVisible();
    await expect.poll(async () => parsePrice(await cart.linePrices.first().innerText())).toBeCloseTo(price * 3, 2);
    await expect.poll(async () => parsePrice(await cart.total.innerText())).toBeCloseTo(price * 3, 2);
  });

  test('CRT-04: removing the only item empties the cart', async ({ page, api }) => {
    const { id } = await api.inStockProduct();
    const cart = await cartWithOneProduct(page, id);

    await cart.removeFirstItem();

    await expect(cart.toast.filter({ hasText: 'Product deleted' })).toBeVisible();
    await expect(cart.itemTitles).toHaveCount(0);
    await expect(page.getByText('The cart is empty')).toBeVisible();
  });

  test('CRT-05: continue shopping returns to the catalog and keeps the cart', async ({ page, api }) => {
    const { id } = await api.inStockProduct();
    const cart = await cartWithOneProduct(page, id);

    await cart.continueShopping.click();

    await expect(page).toHaveURL(/practicesoftwaretesting\.com\/$/);
    await expect(page.getByTestId('cart-quantity')).toHaveText('1');
  });

  test('CRT-06: a visitor with no cart sees no cart link', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByTestId('nav-home')).toBeVisible();
    await expect(page.getByTestId('nav-cart')).toBeHidden();
  });
});
