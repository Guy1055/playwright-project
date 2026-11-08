import { test, expect } from '../../fixtures/test';
import { expectStatus } from '../../api/ToolshopApi';
import { DEMO_ADMIN } from '../../support/env';
import { userPayload } from '../../support/testData';

test.describe('Users API', { tag: '@api' }, () => {
  test('API-USR-01: a new customer can register and log in', { tag: '@sanity' }, async ({ api, adminApi }) => {
    const user = userPayload();

    const response = await api.post('/users/register', user);

    await expectStatus(response, 201);
    const body = await response.json();
    expect(body.email).toBe(user.email);
    expect(body).not.toHaveProperty('password');
    const login = await api.post('/users/login', { email: user.email, password: user.password });
    await expectStatus(login, 200);
    expect(await login.json()).toEqual(expect.objectContaining({ access_token: expect.any(String), token_type: 'bearer' }));
    await adminApi.delete(`/users/${body.id}`);
  });

  test('API-USR-02: a duplicate email is rejected', async ({ api, customer }) => {
    const response = await api.post('/users/register', userPayload({ email: customer.user.email }));

    expect([409, 422]).toContain(response.status());
  });

  for (const { name, change, field } of [
    { name: 'a weak password', change: { password: 'abc' }, field: 'password' },
    { name: 'a missing first name', change: { first_name: '' }, field: 'first_name' },
  ]) {
    test(`API-USR-03: registration rejects ${name}`, async ({ api }) => {
      const response = await api.post('/users/register', userPayload(change));

      await expectStatus(response, 422);
      expect(await response.json()).toHaveProperty(field);
    });
  }

  test('API-USR-03b: registration rejects an invalid email', async ({ api, adminApi }) => {
    test.fail(true, 'BUG-06: the API accepts a malformed email that the UI form rejects');

    const response = await api.post('/users/register', userPayload({ email: 'not-an-email' }));

    if (response.status() === 201) await adminApi.delete(`/users/${(await response.json()).id}`);
    expect(response.status()).toBe(422);
  });

  test('API-USR-04: a wrong password is unauthorized', async ({ api, customer }) => {
    await expectStatus(await api.post('/users/login', { email: customer.user.email, password: 'Wrong!Password1' }), 401);
  });

  test('API-USR-05: repeated failures lock the account', async ({ api, customer }) => {
    // Throwaway user only: running this against a shared demo account would lock it for everyone.
    await expect(async () => {
      const response = await api.post('/users/login', { email: customer.user.email, password: 'Wrong!Password1' });
      expect(response.status()).toBe(423);
    }).toPass({ timeout: 15_000 });
  });

  test('API-USR-06: /users/me returns the logged-in customer', async ({ customer }) => {
    const me = await (await customer.api.get('/users/me')).json();

    expect(me.id).toBe(customer.id);
    expect(me.email).toBe(customer.user.email);
  });

  test('API-USR-07: protected routes need a token', async ({ api }) => {
    await expectStatus(await api.get('/users/me'), 401);
    await expectStatus(await api.get('/users'), 401);
  });

  test('API-USR-08: an invalid token is unauthorized', async ({ api }) => {
    await expectStatus(await api.withToken('not.a.token').get('/users/me'), 401);
  });

  test('API-USR-09: a customer cannot list all users', async ({ customer }) => {
    expect([401, 403]).toContain((await customer.api.get('/users')).status());
  });

  test('API-USR-10: an admin can list and search users', async ({ adminApi, customer }) => {
    const list = await (await adminApi.get('/users')).json();
    expect(list.data.length).toBeGreaterThan(0);

    const found = await (await adminApi.get('/users/search', { params: { q: customer.user.email } })).json();
    expect(found.data.map((u: { id: string }) => u.id)).toContain(customer.id);
  });

  test('API-USR-11: an admin session reports the admin role', async ({ adminApi }) => {
    const me = await (await adminApi.get('/users/me')).json();

    expect(me.email).toBe(DEMO_ADMIN.email);
  });

  test('API-USR-12: a customer can update their own record', async ({ customer }) => {
    const { password: _password, ...details } = customer.user;

    await expectStatus(await customer.api.put(`/users/${customer.id}`, { ...details, first_name: 'Renamed' }), 200);
    expect((await (await customer.api.get(`/users/${customer.id}`)).json()).first_name).toBe('Renamed');

    await expectStatus(await customer.api.patch(`/users/${customer.id}`, { first_name: 'Patched' }), 200);
    expect((await (await customer.api.get(`/users/${customer.id}`)).json()).first_name).toBe('Patched');
  });

  test('API-USR-13: a customer cannot read another user', async ({ customer, adminApi }) => {
    const { data } = await (await adminApi.get('/users')).json();
    const other = data.find((u: { id: string }) => u.id !== customer.id);

    await expectStatus(await customer.api.get(`/users/${other.id}`), 404);
  });

  test('API-USR-14: a customer cannot delete users', async ({ customer }) => {
    expect([401, 403]).toContain((await customer.api.delete(`/users/${customer.id}`)).status());
  });

  test('API-USR-15: an admin can delete a user without orders', async ({ api, adminApi }) => {
    const id = await api.register(userPayload());

    await expectStatus(await adminApi.delete(`/users/${id}`), 204);
    await expectStatus(await adminApi.get(`/users/${id}`), 404);
  });

  test('API-USR-16: changing the password works with the right current one', async ({ api, customer }) => {
    const next = `${customer.user.password}N1`;

    const response = await customer.api.post('/users/change-password', {
      current_password: customer.user.password,
      new_password: next,
      new_password_confirmation: next,
    });

    await expectStatus(response, 200);
    await expectStatus(await api.post('/users/login', { email: customer.user.email, password: next }), 200);
  });

  test('API-USR-17: changing the password fails with a wrong current one', async ({ customer }) => {
    const next = `${customer.user.password}N1`;

    const response = await customer.api.post('/users/change-password', {
      current_password: 'Not!TheCurrent1',
      new_password: next,
      new_password_confirmation: next,
    });

    expect(response.status()).toBeGreaterThanOrEqual(400);
  });

  test('API-USR-18: forgot password accepts a registered email', async ({ api, customer }) => {
    // Resets the password, so it must only ever target a user the test created.
    await expectStatus(await api.post('/users/forgot-password', { email: customer.user.email }), 200);
  });

  test('API-USR-19: logout invalidates the token', async ({ customer }) => {
    await expectStatus(await customer.api.get('/users/logout'), 200);

    await expectStatus(await customer.api.get('/users/me'), 401);
  });

  test('API-USR-20: a token can be refreshed', async ({ api, customer }) => {
    const response = await customer.api.get('/users/refresh');

    await expectStatus(response, 200);
    const { access_token: fresh } = await response.json();
    await expectStatus(await api.withToken(fresh).get('/users/me'), 200);
  });
});

test.describe('Two-factor API', { tag: '@api' }, () => {
  test('API-TOTP-01: setup returns a secret and an otpauth URL', async ({ customer }) => {
    const response = await customer.api.post('/totp/setup');

    await expectStatus(response, 200);
    const body = await response.json();
    expect(body.secret).toEqual(expect.any(String));
    expect(body.qrCodeUrl).toContain('otpauth://totp/');
  });

  test('API-TOTP-02: a wrong code is rejected', async ({ customer }) => {
    await customer.api.post('/totp/setup');

    const response = await customer.api.post('/totp/verify', { totp: '000000', access_token: customer.token });

    await expectStatus(response, 400);
    expect((await response.json()).error).toBe('Invalid TOTP');
  });

  test('API-TOTP-03: setup needs a token', async ({ api }) => {
    await expectStatus(await api.post('/totp/setup'), 401);
  });
});

test.describe('Reports API', { tag: '@api' }, () => {
  for (const { report, keys } of [
    { report: 'total-sales-per-country', keys: ['total_sales', 'billing_country'] },
    { report: 'top10-purchased-products', keys: ['name', 'count'] },
    { report: 'top10-best-selling-categories', keys: ['category_name', 'total_earned'] },
    { report: 'total-sales-of-years', keys: ['year', 'total'] },
    { report: 'customers-by-country', keys: ['amount', 'country'] },
  ]) {
    test(`API-RPT-01: ${report} returns rows`, async ({ adminApi }) => {
      const response = await adminApi.get(`/reports/${report}`);

      await expectStatus(response, 200);
      const rows = await response.json();
      expect(Array.isArray(rows)).toBe(true);
      if (rows.length > 0) {
        for (const key of keys) expect(rows[0]).toHaveProperty(key);
      }
    });
  }

  for (const report of ['average-sales-per-month', 'average-sales-per-week']) {
    test(`API-RPT-02: ${report} accepts a year`, async ({ adminApi }) => {
      const year = new Date().getFullYear();

      const response = await adminApi.get(`/reports/${report}`, { params: { year } });

      await expectStatus(response, 200);
      expect(Array.isArray(await response.json())).toBe(true);
    });
  }

  test('API-RPT-03: reports need an admin', async ({ api, customer }) => {
    await expectStatus(await api.get('/reports/customers-by-country'), 401);
    expect([401, 403]).toContain((await customer.api.get('/reports/customers-by-country')).status());
  });
});
