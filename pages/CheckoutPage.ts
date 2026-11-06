import { type Page, type Locator } from '@playwright/test';

export class CheckoutPage {
  readonly paymentMethod: Locator;
  readonly finish: Locator;
  readonly paymentSuccess: Locator;

  constructor(private readonly page: Page) {
    this.paymentMethod = page.getByTestId('payment-method');
    this.finish = page.getByTestId('finish');
    this.paymentSuccess = page.getByTestId('payment-success-message');
  }

  async proceedFromCart() {
    await this.page.getByTestId('proceed-1').click();
  }

  /** Step 2 when already logged in: just continue. */
  async proceedFromSignIn() {
    await this.page.getByTestId('proceed-2').click();
  }

  async fillAddressAndContinue() {
    await this.page.getByTestId('street').fill('Test Street');
    await this.page.getByTestId('city').fill('Amsterdam');
    await this.page.getByTestId('state').fill('Noord-Holland');
    await this.page.getByTestId('country').selectOption('NL');
    await this.page.getByTestId('house_number').fill('42');
    await this.page.getByTestId('postal_code').fill('1011AB');
    await this.page.getByTestId('proceed-3').click();
  }

  async payWithCashOnDelivery() {
    await this.paymentMethod.selectOption('cash-on-delivery');
    await this.finish.click();
  }
}
