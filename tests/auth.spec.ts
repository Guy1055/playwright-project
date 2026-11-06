import { test, expect } from '@playwright/test';
import { RegisterPage, createTestUser } from '../pages/RegisterPage';
import { LoginPage } from '../pages/LoginPage';

test.describe('Authentication', { tag: '@sanity' }, () => {
  test('a new user can register and is sent to the login page', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.goto();

    await register.register(createTestUser());

    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test('a registered user can log in and sees the account page', async ({ page }) => {
    const user = createTestUser();
    const register = new RegisterPage(page);
    const login = new LoginPage(page);
    await register.goto();
    await register.register(user);
    await expect(page).toHaveURL(/\/auth\/login/);

    await login.login(user.email, user.password);

    await expect(page).toHaveURL(/\/account/);
    await expect(page.getByTestId('nav-menu')).toContainText(user.firstName);
  });
});
