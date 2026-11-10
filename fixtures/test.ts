import { test as base, type Page } from '@playwright/test';
import { ToolshopApi } from '../api/ToolshopApi';
import { DbClient } from '../db/DbClient';
import { DB_URL, DEMO_ADMIN, proxyOptions } from '../support/env';
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

type DbFixtures = {
  /** Skips the test when DB_URL is not set; the public demo exposes no database. */
  db: DbClient;
};

/** Signs the browser in by seeding the token the Angular app reads on start. */
async function seedToken(page: Page, token: string) {
  // Seed once per tab, otherwise a sign-out would be undone by the next page load.
  await page.addInitScript((value) => {
    if (window.sessionStorage.getItem('auth-seeded')) return;
    window.localStorage.setItem('auth-token', value);
    window.sessionStorage.setItem('auth-seeded', '1');
  }, token);
}

export const test = base.extend<TestFixtures & DbFixtures, WorkerFixtures>({
  db: async ({}, use, testInfo) => {
    testInfo.skip(!DB_URL, 'DB_URL is not set: the public demo exposes no database');
    const client = await DbClient.connect(DB_URL!);
    await use(client);
    await client.close();
  },

  adminToken: [
    async ({ playwright }, use) => {
      const context = await playwright.request.newContext({ proxy: proxyOptions() });
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

  customer: async ({ api, adminApi }, use, testInfo) => {
    const user = userPayload();
    const id = await api.register(user);
    try {
      const token = await api.login(user.email, user.password);
      await use({ id, token, user, api: api.withToken(token) });
    } finally {
      // Best effort: a user who placed an order cannot be deleted (foreign key),
      // but an expired admin token must not silently leak users.
      const response = await adminApi.delete(`/users/${id}`).catch(() => undefined);
      if (response?.status() === 401) {
        testInfo.annotations.push({ type: 'cleanup', description: `admin token rejected, user ${id} was not deleted` });
      }
    }
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
