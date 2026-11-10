import { type Page, type Locator } from '@playwright/test';
import type { UserPayload } from '../support/testData';

export class RegisterPage {
  readonly submit: Locator;

  constructor(private readonly page: Page) {
    this.submit = page.getByTestId('register-submit');
  }

  async goto() {
    await this.page.goto('/auth/register');
  }

  /** Fills the form from a `userPayload()` and submits it. */
  async register(user: UserPayload) {
    const { address } = user;
    await this.page.getByTestId('first-name').fill(user.first_name);
    await this.page.getByTestId('last-name').fill(user.last_name);
    await this.page.getByTestId('dob').fill(user.dob);
    await this.page.getByTestId('country').selectOption(address.country);
    await this.page.getByTestId('postal_code').fill(address.postal_code);
    await this.page.getByTestId('house_number').fill(address.house_number);
    await this.page.getByTestId('street').fill(address.street);
    await this.page.getByTestId('city').fill(address.city);
    await this.page.getByTestId('state').fill(address.state);
    await this.page.getByTestId('phone').fill(user.phone);
    await this.page.getByTestId('email').fill(user.email);
    await this.page.getByTestId('password').fill(user.password);
    await this.submit.click();
  }
}
