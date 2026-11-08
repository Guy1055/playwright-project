import { test, expect, type Customer } from '../../fixtures/test';
import { expectStatus, type ToolshopApi } from '../../api/ToolshopApi';
import { CONTACT_MESSAGE, uniqueId, userPayload } from '../../support/testData';

async function placeOrder(api: ToolshopApi, customer: Customer) {
  const { id } = await api.inStockProduct();
  const cartId = await api.createCartWith(id);
  const response = await customer.api.post('/invoices', await api.billingFor(cartId));
  await expectStatus(response, 201);
  return response.json();
}

test.describe('Cart API', { tag: '@api' }, () => {
  test('API-CRT-01: full lifecycle of a cart', { tag: '@sanity' }, async ({ api }) => {
    const { id: productId } = await api.inStockProduct();
    const cartId = await api.createCart();

    await expectStatus(await api.post(`/carts/${cartId}`, { product_id: productId, quantity: 1 }), 200);
    let cart = await (await api.get(`/carts/${cartId}`)).json();
    expect(cart.cart_items).toHaveLength(1);
    expect(cart.cart_items[0].quantity).toBe(1);

    await expectStatus(await api.put(`/carts/${cartId}/product/quantity`, { product_id: productId, quantity: 3 }), 200);
    cart = await (await api.get(`/carts/${cartId}`)).json();
    expect(cart.cart_items[0].quantity).toBe(3);

    await expectStatus(await api.delete(`/carts/${cartId}/product/${productId}`), 204);
    cart = await (await api.get(`/carts/${cartId}`)).json();
    expect(cart.cart_items).toHaveLength(0);

    await expectStatus(await api.delete(`/carts/${cartId}`), 204);
    await expectStatus(await api.get(`/carts/${cartId}`), 404);
  });

  test('API-CRT-02: adding the same product twice raises the quantity', async ({ api }) => {
    const { id: productId } = await api.inStockProduct();
    const cartId = await api.createCartWith(productId, 1);

    await expectStatus(await api.post(`/carts/${cartId}`, { product_id: productId, quantity: 2 }), 200);

    const cart = await (await api.get(`/carts/${cartId}`)).json();
    expect(cart.cart_items).toHaveLength(1);
    expect(cart.cart_items[0].quantity).toBe(3);
    await api.delete(`/carts/${cartId}`);
  });

  test('API-CRT-03: an unknown cart is a 404', async ({ api }) => {
    await expectStatus(await api.get('/carts/does-not-exist'), 404);
  });
});

test.describe('Payment API', { tag: '@api' }, () => {
  const methods: { payment_method: string; payment_details: Record<string, string> }[] = [
    { payment_method: 'cash-on-delivery', payment_details: {} },
    { payment_method: 'gift-card', payment_details: { gift_card_number: 'ABCD1234EFGH5678', validation_code: 'AB12' } },
    { payment_method: 'bank-transfer', payment_details: { bank_name: 'Test Bank', account_name: 'Test User', account_number: '12345678' } },
  ];

  for (const body of methods) {
    test(`API-PAY-01: ${body.payment_method} is accepted`, async ({ api }) => {
      const response = await api.post('/payment/check', body);

      await expectStatus(response, 200);
      expect((await response.json()).message).toBe('Payment was successful');
    });
  }

  test('API-PAY-02: an unknown payment method is rejected', async ({ api }) => {
    test.fail(true, 'BUG-04: /payment/check answers 200 for a method that does not exist');

    expect((await api.post('/payment/check', { payment_method: 'nope', payment_details: {} })).status()).toBeGreaterThanOrEqual(400);
  });
});

test.describe('Invoices API', { tag: '@api' }, () => {
  test('API-INV-01: a customer can place an order', { tag: '@sanity' }, async ({ api, customer }) => {
    const invoice = await placeOrder(api, customer);

    expect(invoice.invoice_number).toMatch(/^INV-/);
    expect(invoice.total).toBeGreaterThan(0);
    expect(invoice.user_id).toBe(customer.id);
  });

  test('API-INV-02: the order shows in the customer list and details', async ({ api, customer }) => {
    const invoice = await placeOrder(api, customer);

    const list = await (await customer.api.get('/invoices')).json();
    expect(list.data).toHaveLength(1);
    expect(list.data[0].id).toBe(invoice.id);

    const details = await (await customer.api.get(`/invoices/${invoice.id}`)).json();
    expect(details.invoice_number).toBe(invoice.invoice_number);
    expect(details.status).toBe('AWAITING_FULFILLMENT');
  });

  test('API-INV-03: a guest can place an order', async ({ api }) => {
    const { id } = await api.inStockProduct();
    const cartId = await api.createCartWith(id);
    const email = `qa.guest.${uniqueId()}@example.com`;

    const response = await api.post('/invoices/guest', {
      ...(await api.billingFor(cartId)),
      email,
      guest_email: email,
      first_name: 'Test',
      guest_first_name: 'Test',
      last_name: 'Guest',
      guest_last_name: 'Guest',
    });

    await expectStatus(response, 201);
    expect((await response.json()).user_id).toBeNull();
  });

  test('API-INV-04: a city that does not match the postcode is rejected', async ({ api, customer }) => {
    const { id } = await api.inStockProduct();
    const cartId = await api.createCartWith(id);
    const billing = { ...(await api.billingFor(cartId)), billing_city: 'Definitely Not A Match' };

    const response = await customer.api.post('/invoices', billing);

    await expectStatus(response, 422);
    expect(await response.json()).toHaveProperty('billing_country');
    await api.delete(`/carts/${cartId}`);
  });

  test('API-INV-05: missing fields are rejected', async ({ customer }) => {
    await expectStatus(await customer.api.post('/invoices', {}), 422);
  });

  test('API-INV-06: invoices need a token', async ({ api }) => {
    await expectStatus(await api.get('/invoices'), 401);
    await expectStatus(await api.post('/invoices', {}), 401);
  });

  test('API-INV-07: a customer cannot read another customer\'s invoice', async ({ api, customer, adminApi }) => {
    const invoice = await placeOrder(api, customer);
    const stranger = userPayload();
    const strangerId = await api.register(stranger);
    const strangerApi = api.withToken(await api.login(stranger.email, stranger.password));

    const response = await strangerApi.get(`/invoices/${invoice.id}`);

    expect([403, 404]).toContain(response.status());
    await adminApi.delete(`/users/${strangerId}`);
  });

  test('API-INV-11: an admin can replace the billing details', async ({ api, customer, adminApi }) => {
    test.fail(true, 'BUG-05: PUT /invoices/{id} answers 404 for an invoice that exists');
    const invoice = await placeOrder(api, customer);
    const billing = await api.billingFor('unused');

    const response = await adminApi.put(`/invoices/${invoice.id}`, { ...billing, billing_street: 'Replaced Street' });

    await expectStatus(response, 200);
    expect((await (await adminApi.get(`/invoices/${invoice.id}`)).json()).billing_street).toBe('Replaced Street');
  });

  test('API-INV-12: an admin can patch the billing street', async ({ api, customer, adminApi }) => {
    test.fail(true, 'BUG-05: PATCH /invoices/{id} answers 404 for an invoice that exists');
    const invoice = await placeOrder(api, customer);

    await expectStatus(await adminApi.patch(`/invoices/${invoice.id}`, { billing_street: 'Patched Street' }), 200);
  });

  test('API-INV-13: the PDF cannot be downloaded before it exists', async ({ api, customer }) => {
    const invoice = await placeOrder(api, customer);

    const response = await customer.api.get(`/invoices/${invoice.invoice_number}/download-pdf`);

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('API-INV-08: an admin can search and update status', async ({ api, customer, adminApi }) => {
    const invoice = await placeOrder(api, customer);

    const found = await (await adminApi.get('/invoices/search', { params: { q: invoice.invoice_number } })).json();
    expect(found.data.map((i: { id: string }) => i.id)).toContain(invoice.id);

    await expectStatus(await adminApi.put(`/invoices/${invoice.id}/status`, { status: 'SHIPPED', status_message: 'Shipped by QA' }), 200);
    expect((await (await adminApi.get(`/invoices/${invoice.id}`)).json()).status).toBe('SHIPPED');
  });

  test('API-INV-09: a status message that is too short is rejected', async ({ api, customer, adminApi }) => {
    const invoice = await placeOrder(api, customer);

    await expectStatus(await adminApi.put(`/invoices/${invoice.id}/status`, { status: 'SHIPPED', status_message: 'abc' }), 422);
  });

  test('API-INV-10: the PDF has not been generated right after the order', async ({ api, customer }) => {
    const invoice = await placeOrder(api, customer);

    const response = await customer.api.get(`/invoices/${invoice.invoice_number}/download-pdf-status`);

    await expectStatus(response, 400);
    expect((await response.json()).status).toBe('NOT_INITIATED');
  });
});

test.describe('Favorites API', { tag: '@api' }, () => {
  test('API-FAV-01: full lifecycle of a favorite', async ({ api, customer }) => {
    const { id: productId } = await api.inStockProduct();

    const created = await customer.api.post('/favorites', { product_id: productId });
    await expectStatus(created, 201);
    const { id } = await created.json();

    const list: { id: string }[] = await (await customer.api.get('/favorites')).json();
    expect(list.map((f) => f.id)).toContain(id);
    await expectStatus(await customer.api.get(`/favorites/${id}`), 200);
    await expectStatus(await customer.api.delete(`/favorites/${id}`), 204);
    expect(await (await customer.api.get('/favorites')).json()).toEqual([]);
  });

  test('API-FAV-02: favorites need a token', async ({ api }) => {
    await expectStatus(await api.get('/favorites'), 401);
  });

  test('API-FAV-03: an unknown product is rejected', async ({ customer }) => {
    await expectStatus(await customer.api.post('/favorites', { product_id: 'does-not-exist' }), 422);
  });
});

test.describe('Messages API', { tag: '@api' }, () => {
  async function send(customer: Customer) {
    const response = await customer.api.post('/messages', {
      subject: 'webmaster',
      message: CONTACT_MESSAGE,
      name: 'Test User',
      email: customer.user.email,
    });
    await expectStatus(response, 200);
    return response.json();
  }

  test('API-MSG-01: a guest can send a message', async ({ api }) => {
    const response = await api.post('/messages', {
      subject: 'webmaster',
      message: CONTACT_MESSAGE,
      name: 'Test User',
      email: 'qa.contact@example.com',
    });

    await expectStatus(response, 200);
    expect((await response.json()).status).toBe('NEW');
  });

  test('API-MSG-02: subject and message are required', async ({ api }) => {
    await expectStatus(await api.post('/messages', { name: 'Test' }), 422);
  });

  test('API-MSG-03: a message over 250 characters is rejected', async ({ api }) => {
    await expectStatus(await api.post('/messages', { subject: 'webmaster', message: 'x'.repeat(251), name: 'T', email: 'qa@example.com' }), 422);
  });

  test('API-MSG-04: an empty text attachment is accepted', async ({ customer }) => {
    const { id } = await send(customer);

    await expectStatus(await customer.api.attachFile(id, { name: 'empty.txt', mimeType: 'text/plain', buffer: Buffer.alloc(0) }), 200);
  });

  test('API-MSG-09: a non-empty attachment is rejected', async ({ customer }) => {
    const { id } = await send(customer);

    const response = await customer.api.attachFile(id, { name: 'note.txt', mimeType: 'text/plain', buffer: Buffer.from('content') });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('API-MSG-05: reply, then read it back', async ({ customer }) => {
    const { id } = await send(customer);

    await expectStatus(await customer.api.post(`/messages/${id}/reply`, { message: 'A reply from QA' }), 201);

    const message = await (await customer.api.get(`/messages/${id}`)).json();
    expect(message.replies).toHaveLength(1);
    expect(message.replies[0].message).toBe('A reply from QA');
  });

  test('API-MSG-06: an admin can change the status', async ({ customer, adminApi }) => {
    const { id } = await send(customer);

    await expectStatus(await adminApi.put(`/messages/${id}/status`, { status: 'IN_PROGRESS' }), 200);

    expect((await (await adminApi.get(`/messages/${id}`)).json()).status).toBe('IN_PROGRESS');
  });

  test('API-MSG-07: the message list needs a token', async ({ api }) => {
    await expectStatus(await api.get('/messages'), 401);
  });

  test('API-MSG-08: the list shows only the customer\'s own messages', async ({ customer }) => {
    const { id } = await send(customer);

    const { data } = await (await customer.api.get('/messages')).json();

    expect(data.map((m: { id: string }) => m.id)).toEqual([id]);
  });
});
