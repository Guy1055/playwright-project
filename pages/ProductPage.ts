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
  readonly decreaseQuantity: Locator;
  readonly addToFavorites: Locator;
  readonly addToCompare: Locator;
  readonly specRows: Locator;
  readonly relatedProducts: Locator;

  constructor(private readonly page: Page) {
    this.decreaseQuantity = page.getByTestId('decrease-quantity');
    this.addToFavorites = page.getByTestId('add-to-favorites');
    this.addToCompare = page.getByTestId('add-to-compare');
    this.specRows = page.getByTestId('spec-row');
    // Related cards have no dedicated test id; they are the only product cards on this page.
    this.relatedProducts = page.locator('a.card');
    this.name = page.getByTestId('product-name');
    this.unitPrice = page.getByTestId('unit-price');
    this.description = page.getByTestId('product-description');
    this.quantity = page.getByTestId('quantity');
    this.increaseQuantity = page.getByTestId('increase-quantity');
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.cartBadge = page.getByTestId('cart-quantity');
    this.toast = page.getByRole('alert');
  }

  async goto(id: string) {
    await this.page.goto(`/product/${id}`);
  }

  async addToCart() {
    await this.addToCartButton.click();
  }

  /** Opens a product by id (resolved at runtime through the API) and adds it to the cart. */
  async addProductToCart(id: string) {
    await this.goto(id);
    await this.addToCart();
    await this.toast.filter({ hasText: 'added to shopping cart' }).waitFor();
  }
}
