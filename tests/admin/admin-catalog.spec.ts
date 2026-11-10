import { test, expect } from '../../fixtures/test';
import { expectStatus, type ToolshopApi } from '../../api/ToolshopApi';
import { AdminListPage } from '../../pages/admin/AdminListPage';
import { AdminFormPage } from '../../pages/admin/AdminFormPage';
import { uniqueId } from '../../support/testData';

/** Removes a record the test created, found by its unique name. Seed data is never touched. */
async function deleteByName(admin: ToolshopApi, collection: 'brands' | 'categories', name: string) {
  const records: { id: string; name: string }[] = await (await admin.get(`/${collection}/search`, { params: { q: name } })).json();
  for (const record of records.filter((r) => r.name === name)) {
    await admin.delete(`/${collection}/${record.id}`);
  }
}

test.describe('Admin brands', () => {
  async function createBrand(api: ToolshopApi) {
    const id = uniqueId();
    const response = await api.post('/brands', { name: `QA Brand ${id}`, slug: `qa-brand-${id}` });
    await expectStatus(response, 201);
    return response.json();
  }

  test('ADM-10: an admin can add a brand', async ({ adminPage, adminApi }) => {
    const id = uniqueId();
    const name = `QA Brand ${id}`;
    const list = new AdminListPage(adminPage, 'brand', '/admin/brands');
    const form = new AdminFormPage(adminPage);
    await list.goto();

    try {
      await list.addButton.click();
      await form.fillBrandOrCategory(name, `qa-brand-${id}`);
      await form.submit('brand');

      await expect(adminPage.getByTestId('brand-saved')).toBeVisible();
    } finally {
      await deleteByName(adminApi, 'brands', name);
    }
  });

  test('ADM-11: a duplicate brand slug shows an error', async ({ adminPage, api, adminApi }) => {
    test.fail(true, 'BUG-01: the API answers 409 but the form shows no error message');
    const brand = await createBrand(api);
    const form = new AdminFormPage(adminPage);

    try {
      await adminPage.goto('/admin/brands/add');
      await form.fillBrandOrCategory(`QA Other ${uniqueId()}`, brand.slug);
      await form.submit('brand');

      await expect(adminPage.getByTestId('brand-error')).toContainText('already exists');
    } finally {
      await adminApi.delete(`/brands/${brand.id}`);
    }
  });

  test('ADM-12: an admin can rename a brand', async ({ adminPage, api, adminApi }) => {
    const brand = await createBrand(api);
    const form = new AdminFormPage(adminPage);

    try {
      await adminPage.goto(`/admin/brands/edit/${brand.id}`);
      await expect(form.name).toHaveValue(brand.name);
      await form.name.fill(`${brand.name} Renamed`);
      await form.submit('brand');

      await expect(adminPage.getByTestId('brand-saved')).toBeVisible();
      const updated = await (await api.get(`/brands/${brand.id}`)).json();
      expect(updated.name).toBe(`${brand.name} Renamed`);
    } finally {
      await adminApi.delete(`/brands/${brand.id}`);
    }
  });

  test('ADM-13: an admin can find and delete a brand', async ({ adminPage, api, adminApi }) => {
    const brand = await createBrand(api);
    const list = new AdminListPage(adminPage, 'brand', '/admin/brands');

    try {
      await list.goto();
      await list.search(brand.name);
      await list.deleteButton(brand.id).click();

      await expect(list.toast.filter({ hasText: 'Brand deleted' })).toBeVisible();
      await expectStatus(await api.get(`/brands/${brand.id}`), 404);
    } finally {
      // No-op (404) when the UI delete worked.
      await adminApi.delete(`/brands/${brand.id}`);
    }
  });

  test('ADM-14: name and slug are required', async ({ adminPage }) => {
    const form = new AdminFormPage(adminPage);
    await adminPage.goto('/admin/brands/add');

    await form.submit('brand');

    await expect(adminPage.getByTestId('name-error')).toBeVisible();
    await expect(adminPage.getByTestId('slug-error')).toBeVisible();
  });
});

test.describe('Admin categories', () => {
  async function createCategory(api: ToolshopApi) {
    const id = uniqueId();
    const response = await api.post('/categories', { name: `QA Category ${id}`, slug: `qa-category-${id}` });
    await expectStatus(response, 201);
    return response.json();
  }

  test('ADM-20: an admin can add a category', async ({ adminPage, adminApi }) => {
    const id = uniqueId();
    const name = `QA Category ${id}`;
    const form = new AdminFormPage(adminPage);
    await adminPage.goto('/admin/categories/add');

    try {
      await form.fillBrandOrCategory(name, `qa-category-${id}`);
      await form.submit('category');

      await expect(form.success).toBeVisible();
    } finally {
      await deleteByName(adminApi, 'categories', name);
    }
  });

  test('ADM-21: an admin can rename a category', async ({ adminPage, api, adminApi }) => {
    const category = await createCategory(api);
    const form = new AdminFormPage(adminPage);

    try {
      await adminPage.goto(`/admin/categories/edit/${category.id}`);
      await expect(form.name).toHaveValue(category.name);
      await form.name.fill(`${category.name} Renamed`);
      await form.submit('category');

      await expect(form.success).toBeVisible();
    } finally {
      await adminApi.delete(`/categories/${category.id}`);
    }
  });

  test('ADM-22: an admin can find and delete a category', async ({ adminPage, api, adminApi }) => {
    const category = await createCategory(api);
    const list = new AdminListPage(adminPage, 'category', '/admin/categories');

    try {
      await list.goto();
      await list.search(category.name);
      await list.deleteButton(category.id).click();

      await expect(list.toast.filter({ hasText: 'deleted' })).toBeVisible();
      await expectStatus(await api.get(`/categories/tree/${category.id}`), 404);
    } finally {
      // No-op (404) when the UI delete worked.
      await adminApi.delete(`/categories/${category.id}`);
    }
  });
});

test.describe('Admin products', () => {
  async function productDependencies(api: ToolshopApi) {
    const product = await api.inStockProduct();
    return { brandId: product.brand.id, categoryId: product.category.id, imageId: product.product_image.id };
  }

  async function createProduct(api: ToolshopApi) {
    const { brandId, categoryId, imageId } = await productDependencies(api);
    const response = await api.post('/products', {
      name: `Autotest Product ${uniqueId()}`, // full-text search ignores two-letter words
      description: 'Temporary product created by the QA suite.',
      price: 9.99,
      stock: 1,
      category_id: categoryId,
      brand_id: brandId,
      product_image_id: imageId,
      is_location_offer: false,
      is_rental: false,
      co2_rating: 'A',
    });
    await expectStatus(response, 201);
    return response.json();
  }

  test('ADM-30: an admin can add a product', async ({ adminPage, api, adminApi }) => {
    const name = `Autotest Product ${uniqueId()}`;
    const form = new AdminFormPage(adminPage);
    const dependencies = await productDependencies(api);
    await adminPage.goto('/admin/products/add');

    try {
      await expect(adminPage.getByTestId('brand-id').locator(`option[value="${dependencies.brandId}"]`)).toBeAttached();
      await form.fillProduct({
        name,
        description: 'Temporary product created by the QA suite.',
        price: '9.99',
        stock: '1',
        ...dependencies,
      });
      await form.submit('product');

      await expect(form.success).toBeVisible();
    } finally {
      const { data }: { data: { id: string; name: string }[] } = await (
        await api.get('/products/search', { params: { q: name } })
      ).json();
      for (const product of data.filter((p) => p.name === name)) await adminApi.delete(`/products/${product.id}`);
    }
  });

  test('ADM-31: an admin can change a product price', async ({ adminPage, api, adminApi }) => {
    const product = await createProduct(api);
    const dependencies = await productDependencies(api);
    const form = new AdminFormPage(adminPage);

    try {
      await adminPage.goto(`/admin/products/edit/${product.id}`);
      await expect(form.name).toHaveValue(product.name);
      // The edit form does not prefill stock, brand, category or image (BUG-03), so set them again.
      await expect(adminPage.getByTestId('brand-id').locator(`option[value="${dependencies.brandId}"]`)).toBeAttached();
      await form.fillProduct({
        name: product.name,
        description: product.description,
        price: '19.5',
        stock: '1',
        ...dependencies,
      });
      await form.submit('product');

      await expect(form.success).toBeVisible();
      expect((await (await api.get(`/products/${product.id}`)).json()).price).toBe(19.5);
    } finally {
      await adminApi.delete(`/products/${product.id}`);
    }
  });

  test('ADM-32: an admin can find and delete a product', async ({ adminPage, api, adminApi }) => {
    const product = await createProduct(api);
    const list = new AdminListPage(adminPage, 'product', '/admin/products');

    try {
      await list.goto();
      await list.search(product.name);
      await list.deleteButton(product.id).click();

      await expect(list.toast.filter({ hasText: 'deleted' })).toBeVisible();
      await expectStatus(await api.get(`/products/${product.id}`), 404);
    } finally {
      // No-op (404) when the UI delete worked.
      await adminApi.delete(`/products/${product.id}`);
    }
  });

  test('ADM-33: search reset restores the product list', async ({ adminPage }) => {
    const list = new AdminListPage(adminPage, 'product', '/admin/products');
    await list.goto();
    const fullCount = await list.rows.count();

    await list.search('zzzz-no-such-product');
    await expect(list.rows).toHaveCount(0);
    await list.searchReset.click();

    await expect(list.rows).toHaveCount(fullCount);
  });
});
