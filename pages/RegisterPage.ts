import { type Page, type Locator } from '@playwright/test';

export interface NewUser {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

/** Unique throwaway test user; fake data only. */
export function createTestUser(): NewUser {
  const id = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
  return {
    firstName: 'Test',
    lastName: 'User',
    email: `qa.${id}@example.com`,
    password: `Qa!${id}xZ`,
  };
}

export class RegisterPage {
  readonly submit: Locator;

  constructor(private readonly page: Page) {
    this.submit = page.getByTestId('register-submit');
  }

  async goto() {
    await this.page.goto('/auth/register');
  }

  async register(user: NewUser) {
    await this.page.getByTestId('first-name').fill(user.firstName);
    await this.page.getByTestId('last-name').fill(user.lastName);
    await this.page.getByTestId('dob').fill('1990-01-15');
    await this.page.getByTestId('country').selectOption('NL');
    await this.page.getByTestId('postal_code').fill('1011AB');
    await this.page.getByTestId('house_number').fill('42');
    await this.page.getByTestId('street').fill('Test Street');
    await this.page.getByTestId('city').fill('Amsterdam');
    await this.page.getByTestId('state').fill('Noord-Holland');
    await this.page.getByTestId('phone').fill('0612345678');
    await this.page.getByTestId('email').fill(user.email);
    await this.page.getByTestId('password').fill(user.password);
    await this.submit.click();
  }
}
