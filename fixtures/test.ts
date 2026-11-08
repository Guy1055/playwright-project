import { test as base, type Page } from '@playwright/test';
import { ToolshopApi } from '../api/ToolshopApi';
import { DEMO_ADMIN } from '../support/env';
import { userPayload, type UserPayload } from '../support/testData';

export interface Customer {
  id: string;
  token: string;
  user: UserPayload;
  api: ToolshopApi;
}

type TestFixtures = {
  api: ToolshopApi;
  adminApi: ToolshopApi;
  /** A customer registered for this test only, removed afterwards. */
  customer: Customer;
  customerPage: Page;
  adminPage: Page;
};

type WorkerFixtures = { adminToken: string };

/** Signs the browser in by seeding the token the Angular app reads on start. */
async function seedToken(page: Page, token: string) {
  // Seed once per tab, otherwise a sign-out would be undone by the next page load.
  await page.addInitScript((value) => {
    if (window.sessionStorage.getItem('auth-seeded')) return;
    window.localStorage.setItem('auth-token', value);
    window.sessionStorage.setItem('auth-seeded', '1');
  }, token);
}

export const test = base.extend<TestFixtures, WorkerFixtures>({
  adminToken: [
    async ({ playwright }, use) => {
      const proxyServer = process.env.HTTPS_PROXY;
      const context = await playwright.request.newContext({
        proxy: proxyServer ? { server: proxyServer, bypass: process.env.NO_PROXY } : undefined,
      });
      await use(await new ToolshopApi(context).login(DEMO_ADMIN.email, DEMO_ADMIN.password));
      await context.dispose();
    },
    { scope: 'worker' },
  ],

  api: async ({ request }, use) => {
    await use(new ToolshopApi(request));
  },

  adminApi: async ({ api, adminToken }, use) => {
    await use(api.withToken(adminToken));
  },

  customer: async ({ api, adminApi }, use) => {
    const user = userPayload();
    const id = await api.register(user);
    const token = await api.login(user.email, user.password);
    await use({ id, token, user, api: api.withToken(token) });
    // Best effort: a user who placed an order cannot be deleted (foreign key).
    await adminApi.delete(`/users/${id}`).catch(() => undefined);
  },

  customerPage: async ({ page, customer }, use) => {
    await seedToken(page, customer.token);
    await use(page);
  },

  adminPage: async ({ page, adminToken }, use) => {
    await seedToken(page, adminToken);
    await use(page);
  },
});

export { expect } from '@playwright/test';
