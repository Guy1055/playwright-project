import { type Page, type Locator } from '@playwright/test';

export class LoginPage {
  readonly submit: Locator;
  readonly error: Locator;

  constructor(private readonly page: Page) {
    this.submit = page.getByTestId('login-submit');
    this.error = page.getByTestId('login-error');
  }

  async goto() {
    await this.page.goto('/auth/login');
  }

  async login(email: string, password: string) {
    await this.page.getByTestId('email').fill(email);
    await this.page.getByTestId('password').fill(password);
    await this.submit.click();
  }
}
