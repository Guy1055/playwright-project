import { expect, type APIRequestContext, type APIResponse } from '@playwright/test';
import { API_URL } from '../support/env';
import { BILLING_ADDRESS, billingPayload, type UserPayload } from '../support/testData';

export interface Product {
  id: string;
  name: string;
  price: number;
  in_stock: boolean;
  is_rental: boolean;
  category: { id: string; name: string };
  brand: { id: string; name: string };
  product_image: { id: string };
}

type Options = { params?: Record<string, string | number>; data?: unknown };

/** Thin client over the Toolshop REST API. Returns raw responses so tests can assert on status. */
export class ToolshopApi {
  constructor(
    private readonly request: APIRequestContext,
    private readonly token?: string,
  ) {}

  withToken(token: string): ToolshopApi {
    return new ToolshopApi(this.request, token);
  }

  private headers() {
    return {
      accept: 'application/json',
      ...(this.token ? { authorization: `Bearer ${this.token}` } : {}),
    };
  }

  private url(path: string) {
    return `${API_URL}${path}`;
  }

  get(path: string, options: Options = {}) {
    return this.request.get(this.url(path), { headers: this.headers(), params: options.params });
  }

  post(path: string, data?: unknown) {
    return this.request.post(this.url(path), { headers: this.headers(), data });
  }

  put(path: string, data?: unknown) {
    return this.request.put(this.url(path), { headers: this.headers(), data });
  }

  patch(path: string, data?: unknown) {
    return this.request.patch(this.url(path), { headers: this.headers(), data });
  }

  delete(path: string) {
    return this.request.delete(this.url(path), { headers: this.headers() });
  }

  /** Registers a user and returns its id. */
  async register(user: UserPayload): Promise<string> {
    const response = await this.post('/users/register', user);
    await expectStatus(response, 201);
    return (await response.json()).id;
  }

  async login(email: string, password: string): Promise<string> {
    const response = await this.post('/users/login', { email, password });
    await expectStatus(response, 200);
    return (await response.json()).access_token;
  }

  /** First purchasable product on the given catalog page (stock varies on the demo). */
  async inStockProduct(page = 1): Promise<Product> {
    const response = await this.get('/products', { params: { page } });
    await expectStatus(response, 200);
    const { data } = (await response.json()) as { data: Product[] };
    const product = data.find((p) => p.in_stock && !p.is_rental);
    if (!product) throw new Error(`No in-stock product on catalog page ${page}`);
    return product;
  }

  /** Any out-of-stock product, scanning the catalog. Null when the demo currently has none. */
  async outOfStockProduct(): Promise<Product | null> {
    for (let page = 1; page <= 10; page++) {
      const response = await this.get('/products', { params: { page } });
      const body = (await response.json()) as { data: Product[]; last_page: number };
      const product = body.data.find((p) => !p.in_stock);
      if (product) return product;
      if (page >= body.last_page) break;
    }
    return null;
  }

  /** Valid billing details: the API rejects a city that does not match the postcode lookup. */
  async billingFor(cartId: string) {
    const response = await this.get('/postcode-lookup', {
      params: {
        country: BILLING_ADDRESS.country,
        postcode: BILLING_ADDRESS.postcode,
        house_number: BILLING_ADDRESS.houseNumber,
      },
    });
    await expectStatus(response, 200);
    const { city, state } = await response.json();
    return billingPayload(cartId, city, state);
  }

  async createCart(): Promise<string> {
    const response = await this.post('/carts');
    await expectStatus(response, 201);
    return (await response.json()).id;
  }

  async createCartWith(productId: string, quantity = 1): Promise<string> {
    const cartId = await this.createCart();
    await expectStatus(await this.post(`/carts/${cartId}`, { product_id: productId, quantity }), 200);
    return cartId;
  }
}

/** Status assertion that shows the response body when it fails. */
export async function expectStatus(response: APIResponse, status: number) {
  expect(response.status(), `${response.url()}\n${await response.text()}`).toBe(status);
}
