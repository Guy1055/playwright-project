import { type Page, type Locator } from '@playwright/test';
import { parsePrice } from '../support/testData';

export class HomePage {
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly productNames: Locator;
  readonly productPrices: Locator;
  readonly searchReset: Locator;
  readonly searchCaption: Locator;
  readonly noResults: Locator;
  readonly sortSelect: Locator;
  readonly nextPage: Locator;
  readonly ecoFilter: Locator;
  readonly compareButtons: Locator;
  readonly comparisonBar: Locator;
  readonly compareLink: Locator;
  readonly clearComparison: Locator;
  readonly priceMaxSlider: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.productNames = page.getByTestId('product-name');
    this.productPrices = page.getByTestId('product-price');
    this.searchReset = page.getByTestId('search-reset');
    this.searchCaption = page.getByTestId('search-caption');
    this.noResults = page.getByTestId('no-results');
    this.sortSelect = page.getByTestId('sort');
    this.nextPage = page.getByTestId('pagination-next');
    this.ecoFilter = page.getByTestId('eco-friendly-filter');
    this.compareButtons = page.getByTestId('compare-btn');
    this.comparisonBar = page.getByTestId('comparison-bar');
    this.compareLink = page.getByTestId('compare-link');
    this.clearComparison = page.getByTestId('clear-comparison');
    this.priceMaxSlider = page.getByRole('slider').last();
  }

  async goto() {
    await this.page.goto('/');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
    await this.waitFor('search_completed');
  }

  /** The grid exposes its loading state as a data-test value (`sorting_completed`, ...). */
  async waitFor(state: 'search_completed' | 'sorting_completed' | 'filter_completed') {
    await this.page.getByTestId(state).waitFor({ state: 'attached' });
  }

  async sortBy(value: string) {
    await this.sortSelect.selectOption(value);
    await this.waitFor('sorting_completed');
  }

  /** The grid loads through an HTTP QUERY call with the filters in the body, so match on the path. */
  async whileCatalogReloads(action: () => Promise<void>) {
    const loaded = this.page.waitForResponse(
      (r) => /\/products$/.test(r.url()) && r.request().method() === 'QUERY',
    );
    await action();
    await loaded;
  }

  async goToNextPage() {
    await this.whileCatalogReloads(() => this.nextPage.click());
  }

  async prices(): Promise<number[]> {
    return (await this.productPrices.allInnerTexts()).map(parsePrice);
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
