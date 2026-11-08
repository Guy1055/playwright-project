import { type Page, type Locator } from '@playwright/test';

export class NavBar {
  readonly home: Locator;
  readonly categories: Locator;
  readonly contact: Locator;
  readonly signIn: Locator;
  readonly userMenu: Locator;
  readonly signOut: Locator;

  constructor(private readonly page: Page) {
    this.home = page.getByTestId('nav-home');
    this.categories = page.getByTestId('nav-categories');
    this.contact = page.getByTestId('nav-contact');
    this.signIn = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu');
    this.signOut = page.getByTestId('nav-sign-out');
  }

  async openCategory(testId: string) {
    await this.categories.click();
    await this.page.getByTestId(testId).click();
  }

  async logOut() {
    await this.userMenu.click();
    await this.signOut.click();
  }

  /** Opens an entry of the user menu, e.g. `nav-admin-brands` or `nav-my-profile`. */
  async openUserMenuItem(testId: string) {
    await this.userMenu.click();
    await this.page.getByTestId(testId).click();
  }

  /** Report links live in a nested menu that opens on hover; clicking it closes the parent. */
  async openReport(testId: string) {
    await this.userMenu.click();
    await this.page.getByRole('button', { name: 'Reports' }).hover();
    await this.page.getByTestId(testId).click();
  }
}
