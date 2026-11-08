import { type Page, type Locator } from '@playwright/test';

export class FavoritesPage {
  readonly productNames: Locator;
  readonly deleteButtons: Locator;
  readonly emptyMessage: Locator;

  constructor(private readonly page: Page) {
    this.productNames = page.getByTestId('product-name');
    this.deleteButtons = page.getByTestId('delete');
    this.emptyMessage = page.getByText('no favorites', { exact: false });
  }

  async goto() {
    await this.page.goto('/account/favorites');
  }
}
