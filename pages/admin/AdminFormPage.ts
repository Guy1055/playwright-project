import { type Page, type Locator } from '@playwright/test';

export interface ProductForm {
  name: string;
  description: string;
  price: string;
  stock: string;
  brandId: string;
  categoryId: string;
  imageId: string;
}

export interface UserForm {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  dob: string;
  phone: string;
}

/** Add/edit screens for admin records. Fields are addressed by their data-test value. */
export class AdminFormPage {
  readonly title: Locator;
  readonly id: Locator;
  readonly name: Locator;
  readonly slug: Locator;
  readonly success: Locator;
  readonly failure: Locator;

  constructor(private readonly page: Page) {
    this.title = page.getByTestId('page-title');
    this.id = page.getByTestId('id');
    this.name = page.getByTestId('name');
    this.slug = page.getByTestId('slug');
    this.success = page.locator('.alert-success');
    this.failure = page.locator('.alert-danger');
  }

  async submit(entity: 'brand' | 'category' | 'product' | 'user') {
    await this.page.getByTestId(`${entity}-submit`).click();
  }

  async fillBrandOrCategory(name: string, slug: string) {
    await this.name.fill(name);
    await this.slug.fill(slug);
  }

  async fillProduct(product: ProductForm) {
    await this.name.fill(product.name);
    await this.page.getByTestId('description').fill(product.description);
    await this.page.getByTestId('stock').fill(product.stock);
    await this.page.getByTestId('price').fill(product.price);
    await this.page.getByTestId('brand-id').selectOption(product.brandId);
    await this.page.getByTestId('category-id').selectOption(product.categoryId);
    await this.page.getByTestId('product-image-id').selectOption(product.imageId);
  }

  async fillUser(user: UserForm) {
    await this.page.getByTestId('first-name').fill(user.firstName);
    await this.page.getByTestId('last-name').fill(user.lastName);
    await this.page.getByTestId('dob').fill(user.dob);
    await this.page.getByTestId('country').selectOption('NL');
    await this.page.getByTestId('postal_code').fill('1011AB');
    await this.page.getByTestId('street').fill('Test Street');
    await this.page.getByTestId('city').fill('Amsterdam');
    await this.page.getByTestId('state').fill('Noord-Holland');
    await this.page.getByTestId('phone').fill(user.phone);
    await this.page.getByTestId('email').fill(user.email);
    await this.page.getByTestId('password').fill(user.password);
    // Left empty these two make the API answer 500 (BUG-02).
    await this.page.getByTestId('failed_login_attempts').fill('0');
    await this.page.getByTestId('enabled').check();
  }
}
