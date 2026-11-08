import { type Page, type Locator } from '@playwright/test';

export class CheckoutPage {
  readonly paymentMethod: Locator;
  readonly finish: Locator;
  readonly paymentSuccess: Locator;
  readonly addressContinue: Locator;
  readonly guestSubmit: Locator;

  constructor(private readonly page: Page) {
    this.addressContinue = page.getByTestId('proceed-3');
    this.guestSubmit = page.getByTestId('guest-submit');
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

  async openGuestTab() {
    await this.page.getByRole('tab', { name: 'Continue as Guest' }).click();
  }

  async continueAsGuest(email: string, firstName: string, lastName: string) {
    await this.openGuestTab();
    await this.page.getByTestId('guest-email').fill(email);
    await this.page.getByTestId('guest-first-name').fill(firstName);
    await this.page.getByTestId('guest-last-name').fill(lastName);
    await this.guestSubmit.click();
    await this.page.getByTestId('proceed-2-guest').click();
  }

  guestError(field: 'email' | 'first-name' | 'last-name'): Locator {
    return this.page.getByTestId(`guest-${field}-error`);
  }

  /** Fills the fields of the selected payment method; keys are the form's data-test values. */
  async fillPaymentDetails(fields: Record<string, string>) {
    for (const [testId, value] of Object.entries(fields)) {
      const field = this.page.getByTestId(testId);
      const isSelect = await field.evaluate((el) => el.tagName === 'SELECT');
      if (isSelect) await field.selectOption(value);
      else await field.fill(value);
    }
  }

  async pay(method: string, fields: Record<string, string> = {}) {
    await this.paymentMethod.selectOption(method);
    await this.fillPaymentDetails(fields);
    await this.finish.click();
  }
}
