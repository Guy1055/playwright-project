import { type Page, type Locator } from '@playwright/test';

export class CartPage {
  readonly itemTitles: Locator;
  readonly itemQuantities: Locator;
  readonly linePrices: Locator;
  readonly total: Locator;
  readonly toast: Locator;
  readonly continueShopping: Locator;

  constructor(private readonly page: Page) {
    this.toast = page.getByRole('alert');
    this.continueShopping = page.getByTestId('continue-shopping');
    this.itemTitles = page.getByTestId('product-title');
    this.itemQuantities = page.getByTestId('product-quantity');
    this.linePrices = page.getByTestId('line-price');
    this.total = page.getByTestId('cart-total');
  }

  async open() {
    await this.page.getByTestId('nav-cart').click();
  }

  /** The cart input updates on the change event, so commit with Tab. */
  async setQuantity(quantity: number) {
    await this.itemQuantities.first().fill(String(quantity));
    await this.itemQuantities.first().press('Tab');
  }

  async removeFirstItem() {
    // Last resort: the remove control is an unlabelled <a> with no test id or role.
    await this.page.locator('tbody tr').first().locator('a.btn-danger').click();
  }
}
