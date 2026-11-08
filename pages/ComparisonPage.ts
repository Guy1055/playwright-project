import { type Page, type Locator } from '@playwright/test';

export class ComparisonPage {
  readonly title: Locator;
  readonly table: Locator;
  readonly removeButtons: Locator;
  readonly productNames: Locator;
  readonly prices: Locator;
  readonly clearAll: Locator;
  readonly empty: Locator;

  constructor(page: Page) {
    this.title = page.getByTestId('comparison-title');
    this.table = page.getByTestId('comparison-table');
    this.removeButtons = page.getByTestId('remove-product');
    this.productNames = page.getByTestId('product-name');
    this.prices = page.getByTestId('compare-price');
    this.clearAll = page.getByTestId('clear-comparison');
    this.empty = page.getByTestId('comparison-empty');
  }
}
