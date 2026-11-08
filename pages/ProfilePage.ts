import { type Page, type Locator } from '@playwright/test';

export class ProfilePage {
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;
  readonly phone: Locator;
  readonly updateSubmit: Locator;
  readonly changePasswordSubmit: Locator;
  readonly totpSecret: Locator;
  readonly totpCode: Locator;
  readonly totpVerify: Locator;
  readonly totpError: Locator;
  readonly success: Locator;
  readonly failure: Locator;

  constructor(private readonly page: Page) {
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.email = page.getByTestId('email');
    this.phone = page.getByTestId('phone');
    this.updateSubmit = page.getByTestId('update-profile-submit');
    this.changePasswordSubmit = page.getByTestId('change-password-submit');
    this.totpSecret = page.getByTestId('totp-secret');
    this.totpCode = page.getByTestId('totp-code');
    this.totpVerify = page.getByTestId('verify-totp');
    this.totpError = page.getByTestId('totp-error');
    this.success = page.locator('.alert-success');
    this.failure = page.locator('.alert-danger');
  }

  async goto() {
    await this.page.goto('/account/profile');
  }

  async changePassword(current: string, next: string) {
    await this.page.getByTestId('current-password').fill(current);
    await this.page.getByTestId('new-password').fill(next);
    await this.page.getByTestId('new-password-confirm').fill(next);
    await this.changePasswordSubmit.click();
  }
}
