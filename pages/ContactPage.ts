import { type Page, type Locator } from '@playwright/test';

export interface ContactDetails {
  firstName?: string;
  lastName?: string;
  email?: string;
  subject: string;
  message: string;
}

export class ContactPage {
  readonly submit: Locator;
  readonly confirmation: Locator;
  readonly attachment: Locator;
  readonly firstName: Locator;
  readonly lastName: Locator;
  readonly email: Locator;

  constructor(private readonly page: Page) {
    this.submit = page.getByTestId('contact-submit');
    this.confirmation = page.getByRole('alert').filter({ hasText: 'Thanks for your message' });
    this.attachment = page.getByTestId('attachment');
    this.firstName = page.getByTestId('first-name');
    this.lastName = page.getByTestId('last-name');
    this.email = page.getByTestId('email');
  }

  async goto() {
    await this.page.goto('/contact');
  }

  async fill(details: ContactDetails) {
    if (details.firstName) await this.firstName.fill(details.firstName);
    if (details.lastName) await this.lastName.fill(details.lastName);
    if (details.email) await this.email.fill(details.email);
    await this.page.getByTestId('subject').selectOption(details.subject);
    await this.page.getByTestId('message').fill(details.message);
    await this.page.getByTestId('message').blur();
  }

  error(field: 'first-name' | 'last-name' | 'email' | 'subject' | 'message' | 'attachment'): Locator {
    return this.page.getByTestId(`${field}-error`);
  }
}
