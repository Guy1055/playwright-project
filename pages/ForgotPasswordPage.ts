import { type Page, type Locator } from '@playwright/test';

export class ForgotPasswordPage {
  readonly email: Locator;
  readonly submit: Locator;
  readonly emailError: Locator;
  readonly confirmation: Locator;

  constructor(private readonly page: Page) {
    this.email = page.getByTestId('email');
    this.submit = page.getByTestId('forgot-password-submit');
    this.emailError = page.getByTestId('email-error');
    this.confirmation = page.locator('.alert-success');
  }

  async goto() {
    await this.page.goto('/auth/forgot-password');
  }
}
