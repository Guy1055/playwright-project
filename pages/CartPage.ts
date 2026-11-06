import { type Page, type Locator } from '@playwright/test';

export class CartPage {
  readonly itemTitles: Locator;
  readonly itemQuantities: Locator;
  readonly linePrices: Locator;
  readonly total: Locator;

  constructor(private readonly page: Page) {
    this.itemTitles = page.getByTestId('product-title');
    this.itemQuantities = page.getByTestId('product-quantity');
    this.linePrices = page.getByTestId('line-price');
    this.total = page.getByTestId('cart-total');
  }

  async open() {
    await this.page.getByTestId('nav-cart').click();
  }
}

/** Parses "$14.15" / "14.15" into a number. */
export function parsePrice(text: string): number {
  return Number(text.replace(/[^0-9.]/g, ''));
}
