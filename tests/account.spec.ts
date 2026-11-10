import { test, expect } from '../fixtures/test';
import { expectStatus } from '../api/ToolshopApi';
import { AccountPage } from '../pages/AccountPage';
import { ProfilePage } from '../pages/ProfilePage';
import { FavoritesPage } from '../pages/FavoritesPage';
import { InvoicesPage } from '../pages/InvoicesPage';
import { MessagesPage } from '../pages/MessagesPage';
import { CONTACT_MESSAGE } from '../support/testData';

test.describe('Account overview', () => {
  for (const { section, path, title } of [
    { section: 'favorites', path: '/account/favorites', title: 'Favorites' },
    { section: 'profile', path: '/account/profile', title: 'Profile' },
    { section: 'invoices', path: '/account/invoices', title: 'Invoices' },
    { section: 'messages', path: '/account/messages', title: 'Messages' },
  ] as const) {
    test(`ACC-01: the overview links to ${title}`, async ({ customerPage }) => {
      const account = new AccountPage(customerPage);
      await account.goto();
      await expect(account.title).toHaveText('My account');

      await account.link(section).click();

      await expect(customerPage).toHaveURL(new RegExp(`${path}$`));
      await expect(account.title).toContainText(title);
    });
  }
});

test.describe('Profile', () => {
  test('ACC-02: the profile shows the registered details', async ({ customerPage, customer }) => {
    const profile = new ProfilePage(customerPage);

    await profile.goto();

    await expect(profile.firstName).toHaveValue(customer.user.first_name);
    await expect(profile.lastName).toHaveValue(customer.user.last_name);
    await expect(profile.email).toHaveValue(customer.user.email);
  });

  test('ACC-03: updating the profile saves the new value', async ({ customerPage, customer }) => {
    const profile = new ProfilePage(customerPage);
    await profile.goto();
    await expect(profile.firstName).toHaveValue(customer.user.first_name);

    await profile.firstName.fill('Renamed');
    await profile.updateSubmit.click();

    await expect(profile.success).toContainText('successfully updated');
    const me = await (await customer.api.get('/users/me')).json();
    expect(me.first_name).toBe('Renamed');
  });

  test('ACC-04: changing the password lets the user log in with the new one', async ({ customerPage, customer, api }) => {
    const profile = new ProfilePage(customerPage);
    const newPassword = `${customer.user.password}N1`;
    await profile.goto();
    await expect(profile.firstName).toHaveValue(customer.user.first_name);

    await profile.changePassword(customer.user.password, newPassword);

    await expect(profile.success).toContainText('successfully updated');
    await expectStatus(await api.post('/users/login', { email: customer.user.email, password: newPassword }), 200);
  });

  test('ACC-05: a wrong current password is rejected', async ({ customerPage, customer }) => {
    const profile = new ProfilePage(customerPage);
    await profile.goto();
    await expect(profile.firstName).toHaveValue(customer.user.first_name);

    await profile.changePassword('Not!TheCurrent1', `${customer.user.password}N1`);

    await expect(profile.failure).toContainText('current password');
  });

  test('ACC-06: a wrong two-factor code is rejected', async ({ customerPage }) => {
    const profile = new ProfilePage(customerPage);
    await profile.goto();
    await expect(profile.totpSecret).toBeVisible();

    await profile.totpCode.fill('000000');
    await profile.totpVerify.click();

    await expect(profile.totpError).toBeVisible();
  });
});

test.describe('Favorites', () => {
  test('ACC-07: a new customer has no favorites', async ({ customerPage }) => {
    const favorites = new FavoritesPage(customerPage);

    await favorites.goto();

    await expect(customerPage.getByTestId('page-title')).toContainText('Favorites');
    await expect(favorites.productNames).toHaveCount(0);
  });

  test('ACC-08: a favorite can be listed and removed', async ({ customerPage, customer, api }) => {
    const product = await api.inStockProduct();
    await expectStatus(await customer.api.post('/favorites', { product_id: product.id }), 201);
    const favorites = new FavoritesPage(customerPage);
    await favorites.goto();
    await expect(favorites.productNames).toHaveText(product.name);

    await favorites.deleteButtons.click();

    await expect(favorites.productNames).toHaveCount(0);
  });
});

test.describe('Invoices', () => {
  test('ACC-09: a new customer has an empty invoice list', async ({ customerPage }) => {
    const invoices = new InvoicesPage(customerPage);

    await invoices.goto();

    await expect(invoices.title).toContainText('Invoices');
    await expect(invoices.rows).toHaveCount(0);
  });

  test('ACC-10: an order appears in the list and opens its details', async ({ customerPage, customer }) => {
    const invoice = await customer.api.placeOrder();
    const invoices = new InvoicesPage(customerPage);

    await invoices.goto();
    await expect(invoices.rows).toHaveCount(1);
    await expect(invoices.rows.first()).toContainText(invoice.invoice_number);

    await invoices.openDetails(invoice.id);

    await expect(invoices.invoiceNumber).toHaveValue(invoice.invoice_number);
    await expect(invoices.download).toBeVisible();
  });
});

test.describe('Messages', () => {
  test('ACC-11: a sent message appears in the list', async ({ customerPage, customer }) => {
    await customer.api.sendMessage(customer.user.email);
    const messages = new MessagesPage(customerPage);

    await messages.goto();

    await expect(messages.rows).toHaveCount(1);
    await expect(messages.rows.first()).toContainText('webmaster');
  });

  test('ACC-12: a customer can reply on the message page', async ({ customerPage, customer }) => {
    const { id } = await customer.api.sendMessage(customer.user.email);
    const messages = new MessagesPage(customerPage);
    await messages.openDetails(id, CONTACT_MESSAGE);
    const reply = 'A follow-up from the automated QA suite, please ignore this reply.';

    await messages.replyBox.fill(reply);
    await messages.replySubmit.click();

    await expect(customerPage.getByText(reply)).toBeVisible();
  });
});
