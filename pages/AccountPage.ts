import { type Page, type Locator } from '@playwright/test';

/** Account landing page and its shared title. */
export class AccountPage {
  readonly title: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('page-title');
  }

  async goto() {
    await this.page.goto('/account');
  }

  link(section: 'favorites' | 'profile' | 'invoices' | 'messages'): Locator {
    return this.page.getByTestId(`nav-${section}`);
  }
}
