# Templates

## Page object (`pages/HomePage.ts`)
```ts
import { type Page, type Locator } from '@playwright/test';

export class HomePage {
  readonly searchInput: Locator;
  readonly searchSubmit: Locator;
  readonly productNames: Locator;

  constructor(private readonly page: Page) {
    this.searchInput = page.getByTestId('search-query');
    this.searchSubmit = page.getByTestId('search-submit');
    this.productNames = page.getByTestId('product-name');
  }

  async goto() {
    await this.page.goto('/');
  }

  async search(term: string) {
    await this.searchInput.fill(term);
    await this.searchSubmit.click();
  }
}
```

## Spec (`tests/search.spec.ts`)
```ts
import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';

test.describe('Search', { tag: '@sanity' }, () => {
  test('narrows the product list to matching items', async ({ page }) => {
    const home = new HomePage(page);
    await home.goto();

    await home.search('hammer');

    await expect(home.productNames.first()).toContainText(/hammer/i);
  });
});
```

## Bad vs good
- Bad: `await page.waitForTimeout(2000);` -> Good: `await expect(locator).toBeVisible();`
- Bad: `page.locator('div > .card:nth-child(3) a')` -> Good: `page.getByTestId('product-name').nth(2)`
- Bad: `expect(await el.isVisible()).toBe(true)` -> Good: `await expect(el).toBeVisible()`
