import { type Page, type Locator } from '@playwright/test';

export class ProductPage {
  readonly name: Locator;
  readonly unitPrice: Locator;
  readonly description: Locator;
  readonly quantity: Locator;
  readonly increaseQuantity: Locator;
  readonly addToCartButton: Locator;
  readonly cartBadge: Locator;
  readonly toast: Locator;

  constructor(private readonly page: Page) {
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.quantity = page.getByTestId('quantity');
    this.increaseQuantity = page.getByTestId('increase-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.cartBadge = page.getByTestId('cart-quantity');
    this.toast = page.getByRole('alert');
  }

  async addToCart() {
    await this.addToCartButton.click();
  }
}
