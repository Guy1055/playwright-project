import { test, expect } from '../../fixtures/test';
import { expectStatus } from '../../api/ToolshopApi';
import { SQL } from '../../db/queries';
import { CONTACT_MESSAGE, uniqueId } from '../../support/testData';

/** Placeholder tier: skipped unless DB_URL points at a self-hosted Toolshop. */
test.describe('Database: API writes reach the tables', { tag: '@db' }, () => {
  test('DB-01: a registered user is stored with a hashed password', async ({ db, customer }) => {
    const [row] = await db.query<{ email: string; password: string; role: string }>(SQL.userByEmail, [customer.user.email]);

    expect(row.email).toBe(customer.user.email);
    expect(row.role).toBe('user');
    expect(row.password).not.toBe(customer.user.password);
  });

  test('DB-02: an order total equals the sum of its lines', async ({ db, api, customer }) => {
    const { id } = await api.inStockProduct();
    const cartId = await api.createCartWith(id, 2);
    const invoice = await (await customer.api.post('/invoices', await api.billingFor(cartId))).json();

    const [row] = await db.query<{ total: number; user_id: string }>(SQL.invoiceById, [invoice.id]);
    const items = await db.query<{ unit_price: number; quantity: number }>(SQL.invoiceItems, [invoice.id]);

    const sum = items.reduce((total, item) => total + Number(item.unit_price) * item.quantity, 0);
    expect(Number(row.total)).toBeCloseTo(sum, 2);
    expect(row.user_id).toBe(customer.id);
  });

  test('DB-03: cart items are stored with their quantity', async ({ db, api }) => {
    const { id } = await api.inStockProduct();
    const cartId = await api.createCartWith(id, 3);

    const rows = await db.query<{ product_id: string; quantity: number }>(SQL.cartItems, [cartId]);

    expect(rows).toEqual([expect.objectContaining({ product_id: id, quantity: 3 })]);
    await api.delete(`/carts/${cartId}`);
  });

  test('DB-04: a favorite is stored and then removed', async ({ db, api, customer }) => {
    const { id: productId } = await api.inStockProduct();
    const { id } = await (await customer.api.post('/favorites', { product_id: productId })).json();
    expect(await db.query(SQL.favorite, [customer.id, productId])).toHaveLength(1);

    await expectStatus(await customer.api.delete(`/favorites/${id}`), 204);

    expect(await db.query(SQL.favorite, [customer.id, productId])).toHaveLength(0);
  });

  test('DB-05: a contact message is stored as NEW', async ({ db, customer }) => {
    const { id } = await (
      await customer.api.post('/messages', {
        subject: 'webmaster',
        message: CONTACT_MESSAGE,
        name: 'Test User',
        email: customer.user.email,
      })
    ).json();

    const [row] = await db.query<{ status: string; user_id: string }>(SQL.contactRequest, [id]);

    expect(row).toEqual(expect.objectContaining({ status: 'NEW', user_id: customer.id }));
  });

  test('DB-06: a deleted brand leaves no row', async ({ db, api, adminApi }) => {
    const id = uniqueId();
    const brand = await (await api.post('/brands', { name: `QA Brand ${id}`, slug: `qa-brand-${id}` })).json();
    expect(await db.query(SQL.brandById, [brand.id])).toHaveLength(1);

    await expectStatus(await adminApi.delete(`/brands/${brand.id}`), 204);

    expect(await db.query(SQL.brandById, [brand.id])).toHaveLength(0);
  });
});
