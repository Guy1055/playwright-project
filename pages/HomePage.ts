import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
  }

  async goto() {
    await this.page.goto('/');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }

  /** Category checkbox in the sidebar filter (parent or sub-category, e.g. "Hammer"). */
  categoryCheckbox(name: string): Locator {
    return this.page.getByRole('checkbox', { name, exact: true });
  }

  async filterByCategory(name: string) {
    await this.categoryCheckbox(name).check();
  }

  async clearCategory(name: string) {
    await this.categoryCheckbox(name).uncheck();
  }

  /** Trimmed product names currently listed (card names are padded with whitespace). */
  async listedNames(): Promise<string[]> {
    return (await this.productNames.allInnerTexts()).map((n) => n.trim());
  }

  /** Opens the first in-stock product card and returns its name. */
  async openFirstInStockProduct(): Promise<string> {
    const card = this.page
      .locator('a.card')
      .filter({ hasNot: this.page.getByTestId('out-of-stock') })
      .first();
    const name = (await card.getByTestId('product-name').innerText()).trim();
    await card.click();
    return name;
  }
}
