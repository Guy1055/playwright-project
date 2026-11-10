import { test, expect } from '../fixtures/test';
import { HomePage } from '../pages/HomePage';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout', { tag: '@sanity' }, () => {
  test('a logged-in user can complete an order with cash on delivery', async ({ customerPage: page }) => {
    const home = new HomePage(page);
    const product = new ProductPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);

    await home.goto();
    await home.openFirstInStockProduct();
    await product.addToCart();
    await expect(product.cartBadge).toHaveText('1');
    await cart.open();
    await checkout.proceedFromCart();
    await checkout.proceedFromSignIn();
    await checkout.fillAddressAndContinue();
    await checkout.payWithCashOnDelivery();

    await expect(checkout.paymentSuccess).toBeVisible();
  });
});
