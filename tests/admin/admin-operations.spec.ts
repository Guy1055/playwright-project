import { test, expect } from '../../fixtures/test';
import { expectStatus } from '../../api/ToolshopApi';
import { AdminListPage } from '../../pages/admin/AdminListPage';
import { AdminFormPage } from '../../pages/admin/AdminFormPage';
import { AdminOrderPage } from '../../pages/admin/AdminOrderPage';
import { AdminMessagePage } from '../../pages/admin/AdminMessagePage';
import { CONTACT_MESSAGE, uniqueId, userPayload } from '../../support/testData';

test.describe('Admin orders', () => {
  test('ADM-40: an admin can search orders by invoice number', async ({ adminPage, api, customer }) => {
    const invoice = await customer.api.placeOrder();
    const list = new AdminListPage(adminPage, 'order', '/admin/orders');
    await list.goto();

    await list.search(invoice.invoice_number);

    await expect(list.rows).toHaveCount(1);
    await expect(list.rows.first()).toContainText(invoice.invoice_number);
  });

  test('ADM-41: an admin can update the status of an order', async ({ adminPage, api, customer, adminApi }) => {
    const invoice = await customer.api.placeOrder();
    const order = new AdminOrderPage(adminPage);
    await order.goto(invoice.id);
    await expect(order.invoiceNumber).toHaveValue(invoice.invoice_number);

    await order.status.selectOption('SHIPPED');
    await order.updateStatus.click();

    await expect(order.success).toBeVisible();
    expect((await (await adminApi.get(`/invoices/${invoice.id}`)).json()).status).toBe('SHIPPED');
  });
});

test.describe('Admin users', () => {
  test('ADM-50: an admin can add a user', async ({ adminPage, adminApi }) => {
    const user = userPayload({ last_name: 'Admin Added' });
    const { email } = user;
    const form = new AdminFormPage(adminPage);
    await adminPage.goto('/admin/users/add');

    try {
      await form.fillUser(user);
      await form.submit('user');

      await expect(form.success).toBeVisible();
    } finally {
      const { data } = await (await adminApi.get('/users/search', { params: { q: email } })).json();
      for (const user of data.filter((u: { email: string }) => u.email === email)) {
        await adminApi.delete(`/users/${user.id}`);
      }
    }
  });

  test('ADM-51: an admin can edit a user', async ({ adminPage, customer, adminApi }) => {
    const form = new AdminFormPage(adminPage);
    await adminPage.goto(`/admin/users/edit/${customer.id}`);
    await expect(adminPage.getByTestId('email')).toHaveValue(customer.user.email);

    await adminPage.getByTestId('first-name').fill('Edited');
    await form.submit('user');

    await expect(form.success).toBeVisible();
    expect((await (await adminApi.get(`/users/${customer.id}`)).json()).first_name).toBe('Edited');
  });

  test('ADM-52: an admin can find and delete a user', async ({ adminPage, api, adminApi }) => {
    const user = userPayload();
    const id = await api.register(user);
    const list = new AdminListPage(adminPage, 'user', '/admin/users');

    try {
      await list.goto();
      await list.search(user.email);
      await expect(list.rows).toHaveCount(1);
      await list.deleteButton(id).click();

      await expect(list.toast.filter({ hasText: 'deleted' })).toBeVisible();
      await expectStatus(await adminApi.get(`/users/${id}`), 404);
    } finally {
      // No-op (404) when the UI delete worked.
      await adminApi.delete(`/users/${id}`);
    }
  });
});

test.describe('Admin messages', () => {
  test('ADM-60: an admin can reply to a message', async ({ adminPage, customer }) => {
    const { id } = await customer.api.sendMessage(customer.user.email);
    const message = new AdminMessagePage(adminPage);
    await message.goto(id, CONTACT_MESSAGE);
    const reply = 'An admin answer from the automated QA suite, please ignore.';

    await message.replyBox.fill(reply);
    await message.replySubmit.click();

    await expect(adminPage.getByText(reply)).toBeVisible();
  });

  test('ADM-61: an admin can change the message status', async ({ adminPage, customer, adminApi }) => {
    const { id } = await customer.api.sendMessage(customer.user.email);
    const message = new AdminMessagePage(adminPage);
    await message.goto(id, CONTACT_MESSAGE);

    await message.status.selectOption('RESOLVED');

    await expect
      .poll(async () => (await (await adminApi.get(`/messages/${id}`)).json()).status)
      .toBe('RESOLVED');
  });

  test('ADM-62: the message list opens', async ({ adminPage }) => {
    await adminPage.goto('/admin/messages');

    await expect(adminPage.getByTestId('page-title')).toBeVisible();
    await expect(adminPage.locator('[data-test^="message-details-"]').first()).toBeVisible();
  });
});
