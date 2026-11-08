import { type Page, type Locator } from '@playwright/test';

type Entity = 'brand' | 'category' | 'product' | 'user' | 'order';

/** Admin list screens share one layout: title, search form, table, row actions. */
export class AdminListPage {
  readonly title: Locator;
  readonly rows: Locator;
  readonly addButton: Locator;
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly searchReset: Locator;
  readonly toast: Locator;

  constructor(
    private readonly page: Page,
    private readonly entity: Entity,
    private readonly path: string,
  ) {
    this.title = page.getByTestId('page-title');
    this.rows = page.locator('tbody tr');
    this.addButton = page.getByTestId(`${entity}-add`);
    this.searchInput = page.getByTestId(`${entity}-search-query`);
    this.searchSubmit = page.getByTestId(`${entity}-search-submit`);
    this.searchReset = page.getByTestId(`${entity}-search-reset`);
    this.toast = page.getByRole('alert');
  }

  async goto() {
    await this.page.goto(this.path);
    await this.rows.first().waitFor();
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }

  /** Row action buttons embed the record id; the brand ones use a different word order. */
  editButton(id: string): Locator {
    return this.page.getByTestId(this.entity === 'brand' ? `brand-${id}-edit` : `${this.entity}-edit-${id}`);
  }

  deleteButton(id: string): Locator {
    return this.page.getByTestId(this.entity === 'brand' ? `brand-${id}-delete` : `${this.entity}-delete-${id}`);
  }
}
