import type { Page } from '@playwright/test';
import { test, expect } from '../fixtures/test';
import { ProductPage } from '../pages/ProductPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

async function reachSignInStep(page: Page, productId: string) {
  const product = new ProductPage(page);
  const cart = new CartPage(page);
  const checkout = new CheckoutPage(page);
  await product.addProductToCart(productId);
  await cart.open();
  await checkout.proceedFromCart();
  return checkout;
}

const paymentMethods: { method: string; fields: Record<string, string> }[] = [
  { method: 'bank-transfer', fields: { bank_name: 'Test Bank', account_name: 'Test User', account_number: '12345678' } },
  { method: 'cash-on-delivery', fields: {} },
  {
    method: 'credit-card',
    fields: {
      credit_card_number: '1111-1111-1111-1111',
      expiration_date: '12/2035',
      cvv: '123',
      card_holder_name: 'Test User',
    },
  },
  { method: 'buy-now-pay-later', fields: { monthly_installments: '6' } },
  { method: 'gift-card', fields: { gift_card_number: 'ABCD1234EFGH5678', validation_code: 'AB12' } },
];

test.describe('Checkout flows', () => {
  test('CHK-02: a guest can complete an order', async ({ page, api }) => {
    const { id } = await api.inStockProduct();
    const checkout = await reachSignInStep(page, id);

    await checkout.continueAsGuest('qa.guest@example.com', 'Test', 'Guest');
    await checkout.fillAddressAndContinue();
    await checkout.pay('cash-on-delivery');

    await expect(checkout.paymentSuccess).toBeVisible();
  });

  test('CHK-03: the address step cannot continue while required fields are empty', async ({ page, api }) => {
    const { id } = await api.inStockProduct();
    const checkout = await reachSignInStep(page, id);
    await checkout.continueAsGuest('qa.guest@example.com', 'Test', 'Guest');

    await expect(checkout.addressContinue).toBeDisabled();
  });

  test('CHK-06: guest details are validated', async ({ page, api }) => {
    const { id } = await api.inStockProduct();
    const checkout = await reachSignInStep(page, id);
    await checkout.openGuestTab();

    await checkout.guestSubmit.click();

    await expect(checkout.guestError('email')).toBeVisible();
    await expect(checkout.guestError('first-name')).toBeVisible();
    await expect(checkout.guestError('last-name')).toBeVisible();
  });

  for (const { method, fields } of paymentMethods) {
    test(`CHK-04: a customer can pay with ${method}`, async ({ customerPage, api }) => {
      const { id } = await api.inStockProduct();
      const checkout = await reachSignInStep(customerPage, id);
      await checkout.proceedFromSignIn();
      await checkout.fillAddressAndContinue();

      await checkout.pay(method, fields);

      await expect(checkout.paymentSuccess).toBeVisible();
    });
  }

  const invalidPayments: { name: string; method: string; fields: Record<string, string> }[] = [
    { name: 'a malformed card number', method: 'credit-card', fields: { credit_card_number: '1234', expiration_date: '12/2035', cvv: '123', card_holder_name: 'Test User' } },
    { name: 'a past expiry date', method: 'credit-card', fields: { credit_card_number: '1111-1111-1111-1111', expiration_date: '01/2020', cvv: '123', card_holder_name: 'Test User' } },
    { name: 'a short gift card number', method: 'gift-card', fields: { gift_card_number: 'ABC', validation_code: 'AB12' } },
    { name: 'a non-numeric bank account', method: 'bank-transfer', fields: { bank_name: 'Test Bank', account_name: 'Test User', account_number: 'abc' } },
  ];

  for (const { name, method, fields } of invalidPayments) {
    test(`CHK-05: ${name} blocks payment`, async ({ customerPage, api }) => {
      const { id } = await api.inStockProduct();
      const checkout = await reachSignInStep(customerPage, id);
      await checkout.proceedFromSignIn();
      await checkout.fillAddressAndContinue();

      await checkout.paymentMethod.selectOption(method);
      await checkout.fillPaymentDetails(fields);

      await expect(checkout.finish).toBeDisabled();
    });
  }
});
