import { test, expect } from '../fixtures/test';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { NavBar } from '../pages/NavBar';
import { userPayload } from '../support/testData';

test.describe('Login', () => {
  test('AUTH-03: a wrong password shows an error', async ({ page, customer }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.login(customer.user.email, 'Wrong!Password1');

    await expect(login.error).toContainText('Invalid email or password');
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('AUTH-06: empty fields show required messages', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();

    await login.submit.click();

    await expect(page.getByTestId('email-error')).toContainText('Email is required');
    await expect(page.getByTestId('password-error')).toContainText('Password is required');
  });

  test('AUTH-10: repeated failures lock the account', async ({ page, customer }) => {
    // Uses the throwaway user from the fixture; never run this against a shared demo account.
    const login = new LoginPage(page);
    await login.goto();

    await expect(async () => {
      await login.login(customer.user.email, 'Wrong!Password1');
      await expect(login.error).toContainText('locked', { timeout: 1500 });
    }).toPass({ timeout: 20_000 });
  });

  test('AUTH-07: signing out returns to the login page', async ({ customerPage }) => {
    const nav = new NavBar(customerPage);
    await customerPage.goto('/account');
    await expect(nav.userMenu).toContainText('Test');

    await nav.logOut();

    await expect(customerPage).toHaveURL(/\/auth\/login/);
    await expect(nav.signIn).toBeVisible();
  });

  for (const path of ['/account', '/account/profile', '/account/favorites', '/account/invoices', '/account/messages']) {
    test(`AUTH-08: a guest opening ${path} is sent to login`, async ({ page }) => {
      await page.goto(path);

      await expect(page).toHaveURL(/\/auth\/login/);
    });
  }

  test('AUTH-11: a customer cannot open the admin area', async ({ customerPage }) => {
    await customerPage.goto('/admin/dashboard');

    await expect(customerPage).toHaveURL(/\/auth\/login/);
    await expect(customerPage.getByTestId('page-title')).toBeHidden();
  });
});

test.describe('Registration', () => {
  const invalidCases = [
    { name: 'an invalid email', change: { email: 'not-an-email' }, errorField: 'email-error' },
    { name: 'a short password', change: { password: 'Aa1!' }, errorField: 'password-error' },
    { name: 'a password without symbols', change: { password: 'Abcdefgh12' }, errorField: 'password-error' },
    { name: 'a password without digits', change: { password: 'Abcdefgh!!' }, errorField: 'password-error' },
    { name: 'a password without capitals', change: { password: 'abcdefg1!' }, errorField: 'password-error' },
  ];

  for (const { name, change, errorField } of invalidCases) {
    test(`AUTH-04: ${name} is rejected`, async ({ page }) => {
      const register = new RegisterPage(page);
      await register.goto();

      await register.register(userPayload(change));

      await expect(page.getByTestId(errorField)).toBeVisible();
      await expect(page).toHaveURL(/\/auth\/register/);
    });
  }

  test('AUTH-05: an email that is already registered is rejected', async ({ page, customer }) => {
    const register = new RegisterPage(page);
    await register.goto();

    await register.register(userPayload({ email: customer.user.email }));

    await expect(page.getByTestId('register-error')).toContainText('already exists');
  });

  test('AUTH-12: an empty form shows every required message', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();

    await register.submit.click();

    for (const field of ['first-name', 'last-name', 'dob', 'country', 'postal_code', 'house_number', 'street', 'city', 'state', 'phone', 'email', 'password']) {
      await expect(page.getByTestId(`${field}-error`)).toBeVisible();
    }
  });
});

test.describe('Forgot password', () => {
  test('AUTH-09: an empty email shows a required message', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.goto();

    await forgot.submit.click();

    await expect(forgot.emailError).toContainText('Email is required');
  });

  test('AUTH-13: a registered email gets a confirmation', async ({ page, customer }) => {
    // Resets the password, so only ever use a user created by this test.
    const forgot = new ForgotPasswordPage(page);
    await forgot.goto();

    await forgot.email.fill(customer.user.email);
    await forgot.submit.click();

    await expect(forgot.confirmation).toBeVisible();
  });
});
