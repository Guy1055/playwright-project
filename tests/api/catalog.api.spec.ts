import { test, expect } from '../../fixtures/test';
import { expectStatus, type ToolshopApi } from '../../api/ToolshopApi';
import { API_URL } from '../../support/env';
import { uniqueId } from '../../support/testData';

test.describe('Products API', { tag: '@api' }, () => {
  test('API-PRD-01: lists products with pagination metadata', { tag: '@sanity' }, async ({ api }) => {
    const response = await api.get('/products');

    await expectStatus(response, 200);
    const body = await response.json();
    expect(body.current_page).toBe(1);
    expect(body.data.length).toBeGreaterThan(0);
    expect(body.data[0]).toEqual(
      expect.objectContaining({
        id: expect.any(String),
        name: expect.any(String),
        price: expect.any(Number),
        in_stock: expect.any(Boolean),
        category: expect.any(Object),
        brand: expect.any(Object),
      }),
    );
  });

  test('API-PRD-02: page 2 returns other products', async ({ api }) => {
    const first = await (await api.get('/products', { params: { page: 1 } })).json();
    const second = await (await api.get('/products', { params: { page: 2 } })).json();

    expect(second.current_page).toBe(2);
    expect(second.data[0].id).not.toBe(first.data[0].id);
  });

  for (const { sort, direction } of [
    { sort: 'price,asc', direction: 1 },
    { sort: 'price,desc', direction: -1 },
  ]) {
    test(`API-PRD-03: sort=${sort} orders the results`, async ({ api }) => {
      const { data } = await (await api.get('/products', { params: { sort } })).json();
      const prices: number[] = data.map((p: { price: number }) => p.price);

      expect(prices).toEqual([...prices].sort((a, b) => (a - b) * direction));
    });
  }

  test('API-PRD-04: between filters by price', async ({ api }) => {
    const { data } = await (await api.get('/products', { params: { between: 'price,10,20' } })).json();

    expect(data.length).toBeGreaterThan(0);
    for (const product of data) {
      expect(product.price).toBeGreaterThanOrEqual(10);
      expect(product.price).toBeLessThanOrEqual(20);
    }
  });

  test('API-PRD-05: by_category and by_brand narrow the list', async ({ api }) => {
    const sample = await api.inStockProduct();

    const byCategory = await (await api.get('/products', { params: { by_category: sample.category.id } })).json();
    const byBrand = await (await api.get('/products', { params: { by_brand: sample.brand.id } })).json();

    expect(byCategory.data.every((p: { category: { id: string } }) => p.category.id === sample.category.id)).toBe(true);
    expect(byBrand.data.every((p: { brand: { id: string } }) => p.brand.id === sample.brand.id)).toBe(true);
  });

  test('API-PRD-06: returns one product with specs', async ({ api }) => {
    const { id, name } = await api.inStockProduct();

    const response = await api.get(`/products/${id}`);

    await expectStatus(response, 200);
    const body = await response.json();
    expect(body.name).toBe(name);
    expect(Array.isArray(body.specs)).toBe(true);
  });

  test('API-PRD-07: an unknown product is a 404', async ({ api }) => {
    await expectStatus(await api.get('/products/does-not-exist'), 404);
  });

  test('API-PRD-08: related products exclude the product itself', async ({ api }) => {
    const { id } = await api.inStockProduct();

    const related: { id: string }[] = await (await api.get(`/products/${id}/related`)).json();

    expect(related.length).toBeGreaterThan(0);
    expect(related.map((p) => p.id)).not.toContain(id);
  });

  test('API-PRD-09: search matches on the name', async ({ api }) => {
    const { data } = await (await api.get('/products/search', { params: { q: 'hammer' } })).json();

    expect(data.length).toBeGreaterThan(0);
    expect(data.some((p: { name: string }) => /hammer/i.test(p.name))).toBe(true);
  });

  test('API-PRD-10: search with no match is empty', async ({ api }) => {
    const { data } = await (await api.get('/products/search', { params: { q: 'zzzznothing' } })).json();

    expect(data).toEqual([]);
  });

  test('API-PRD-11: creating a product needs the required fields', async ({ api }) => {
    const response = await api.post('/products', { name: `Autotest Product ${uniqueId()}` });

    await expectStatus(response, 422);
    const errors = await response.json();
    expect(errors).toHaveProperty('price');
    expect(errors).toHaveProperty('category_id');
  });

  test('API-PRD-12: full lifecycle of a product and its specs', async ({ api, adminApi }) => {
    const sample = await api.inStockProduct();
    const name = `Autotest Product ${uniqueId()}`;
    const payload = {
      name,
      description: 'Temporary product created by the QA suite.',
      price: 9.99,
      stock: 1,
      category_id: sample.category.id,
      brand_id: sample.brand.id,
      product_image_id: sample.product_image.id,
      is_location_offer: false,
      is_rental: false,
      co2_rating: 'A',
    };
    const created = await api.post('/products', payload);
    await expectStatus(created, 201);
    const { id } = await created.json();

    try {
      await expectStatus(await api.put(`/products/${id}`, { ...payload, name: `${name} Two` }), 200);
      expect((await (await api.get(`/products/${id}`)).json()).name).toBe(`${name} Two`);

      await expectStatus(await api.patch(`/products/${id}`, { price: 2.5 }), 200);
      expect((await (await api.get(`/products/${id}`)).json()).price).toBe(2.5);

      const spec = await adminApi.post(`/products/${id}/specs`, { spec_name: 'Weight', spec_value: '1.5', spec_unit: 'kg' });
      await expectStatus(spec, 201);
      const specId = (await spec.json()).id;
      await expectStatus(await api.get(`/products/${id}/specs/${specId}`), 200);
      await expectStatus(await adminApi.put(`/products/${id}/specs/${specId}`, { spec_name: 'Weight', spec_value: '2', spec_unit: 'kg' }), 200);
      expect((await (await api.get(`/products/${id}/specs`)).json())[0].spec_value).toBe('2');
      await expectStatus(await adminApi.delete(`/products/${id}/specs/${specId}`), 204);
    } finally {
      await expectStatus(await adminApi.delete(`/products/${id}`), 204);
    }
    await expectStatus(await api.get(`/products/${id}`), 404);
  });

  test('API-PRD-13: deleting a product needs an admin', async ({ api, customer }) => {
    const { id } = await api.inStockProduct();

    await expectStatus(await api.delete(`/products/${id}`), 401);
    await expectStatus(await customer.api.delete(`/products/${id}`), 403);
  });

  test('API-PRD-14: specification names are listed', async ({ api }) => {
    const names: { name: string; values: string[] }[] = await (await api.get('/product-specs/names')).json();

    expect(names.length).toBeGreaterThan(0);
    expect(names[0]).toEqual(expect.objectContaining({ name: expect.any(String), values: expect.any(Array) }));
  });

  test('API-PRD-15: changing a spec needs a token', async ({ api }) => {
    const { id } = await api.inStockProduct();

    await expectStatus(await api.post(`/products/${id}/specs`, { spec_name: 'X', spec_value: '1' }), 401);
  });
});

test.describe('Brands API', { tag: '@api' }, () => {
  test('API-BRD-01: lists and searches brands', async ({ api }) => {
    const brands: { id: string; name: string }[] = await (await api.get('/brands')).json();
    expect(brands.length).toBeGreaterThan(0);
    const word = brands[0].name.split(' ')[0];

    const found: { id: string }[] = await (await api.get('/brands/search', { params: { q: word } })).json();

    expect(found.map((b) => b.id)).toContain(brands[0].id);
  });

  test('API-BRD-02: full lifecycle of a brand', async ({ api, adminApi }) => {
    const id = uniqueId();
    const created = await api.post('/brands', { name: `QA Brand ${id}`, slug: `qa-brand-${id}` });
    await expectStatus(created, 201);
    const brand = await created.json();

    try {
      await expectStatus(await api.get(`/brands/${brand.id}`), 200);
      await expectStatus(await api.put(`/brands/${brand.id}`, { name: `QA Brand ${id} Renamed`, slug: brand.slug }), 200);
      await expectStatus(await api.patch(`/brands/${brand.id}`, { name: `QA Brand ${id}` }), 200);
      expect((await (await api.get(`/brands/${brand.id}`)).json()).name).toBe(`QA Brand ${id}`);
    } finally {
      await expectStatus(await adminApi.delete(`/brands/${brand.id}`), 204);
    }
    await expectStatus(await api.get(`/brands/${brand.id}`), 404);
  });

  test('API-BRD-03: a duplicate slug is a conflict', async ({ api, adminApi }) => {
    const id = uniqueId();
    const brand = await (await api.post('/brands', { name: `QA Brand ${id}`, slug: `qa-brand-${id}` })).json();

    try {
      await expectStatus(await api.post('/brands', { name: 'Duplicate', slug: brand.slug }), 409);
    } finally {
      await adminApi.delete(`/brands/${brand.id}`);
    }
  });

  test('API-BRD-04: missing fields are rejected', async ({ api }) => {
    await expectStatus(await api.post('/brands', {}), 422);
  });

  test('API-BRD-05: deleting a brand needs an admin', async ({ api, customer }) => {
    const [brand] = await (await api.get('/brands')).json();

    await expectStatus(await api.delete(`/brands/${brand.id}`), 401);
    await expectStatus(await customer.api.delete(`/brands/${brand.id}`), 403);
  });
});

test.describe('Categories API', { tag: '@api' }, () => {
  async function createCategory(api: ToolshopApi) {
    const id = uniqueId();
    const response = await api.post('/categories', { name: `QA Category ${id}`, slug: `qa-category-${id}` });
    await expectStatus(response, 201);
    return response.json();
  }

  test('API-CAT-01: lists categories', async ({ api }) => {
    const categories = await (await api.get('/categories')).json();

    expect(categories.length).toBeGreaterThan(0);
  });

  test('API-CAT-02: the tree nests sub-categories', async ({ api }) => {
    const tree: { sub_categories: unknown[] }[] = await (await api.get('/categories/tree')).json();

    expect(tree.length).toBeGreaterThan(0);
    expect(tree.some((c) => c.sub_categories.length > 0)).toBe(true);
  });

  test('API-CAT-03: search finds a category', async ({ api }) => {
    const found: { name: string }[] = await (await api.get('/categories/search', { params: { q: 'hammer' } })).json();

    expect(found.some((c) => /hammer/i.test(c.name))).toBe(true);
  });

  test('API-CAT-04: full lifecycle of a category', async ({ api, adminApi }) => {
    const category = await createCategory(api);

    try {
      const single = await api.get(`/categories/tree/${category.id}`);
      await expectStatus(single, 200);
      expect((await single.json()).sub_categories).toEqual([]);
      await expectStatus(await api.put(`/categories/${category.id}`, { name: `${category.name} Renamed`, slug: category.slug }), 200);
      await expectStatus(await api.patch(`/categories/${category.id}`, { name: category.name }), 200);
    } finally {
      await expectStatus(await adminApi.delete(`/categories/${category.id}`), 204);
    }
  });

  test('API-CAT-05: deleting a category needs an admin', async ({ api, customer }) => {
    const [category] = await (await api.get('/categories')).json();

    await expectStatus(await api.delete(`/categories/${category.id}`), 401);
    await expectStatus(await customer.api.delete(`/categories/${category.id}`), 403);
  });
});

test.describe('Reference data API', { tag: '@api' }, () => {
  test('API-IMG-01: lists product images', async ({ api }) => {
    const images = await (await api.get('/images')).json();

    expect(images.length).toBeGreaterThan(0);
    expect(images[0]).toHaveProperty('file_name');
  });

  test('API-STR-01: the sales stream is server-sent events', async () => {
    // Native fetch, because the stream never ends and the request fixture waits for the body.
    const controller = new AbortController();
    const response = await fetch(`${API_URL}/sales-stream`, { signal: controller.signal });

    expect(response.status).toBe(200);
    expect(response.headers.get('content-type')).toContain('text/event-stream');
    controller.abort();
  });

  test('API-PST-01: looks up a Dutch postcode', async ({ api }) => {
    const response = await api.get('/postcode-lookup', { params: { country: 'NL', postcode: '1011AB', house_number: '42' } });

    await expectStatus(response, 200);
    expect(await response.json()).toEqual(expect.objectContaining({ city: expect.any(String), country: 'NL', postcode: '1011AB' }));
  });
});
