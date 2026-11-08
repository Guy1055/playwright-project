import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../../fixtures/test';

test.describe('Accessibility', { tag: '@a11y' }, () => {
  const passwordToggleBug = 'BUG-07: the show/hide password button has no accessible name';

  for (const { name, path, ready, knownIssue } of [
    { name: 'catalog', path: '/', ready: 'product-name' },
    { name: 'login', path: '/auth/login', ready: 'login-submit', knownIssue: passwordToggleBug },
    { name: 'register', path: '/auth/register', ready: 'register-submit', knownIssue: passwordToggleBug },
    { name: 'forgot password', path: '/auth/forgot-password', ready: 'forgot-password-submit' },
    { name: 'contact', path: '/contact', ready: 'contact-submit' },
  ]) {
    test(`A11Y-01: the ${name} page has no critical violations`, async ({ page }) => {
      test.fail(!!knownIssue, knownIssue);
      await page.goto(path);
      await page.getByTestId(ready).first().waitFor();

      const { violations } = await new AxeBuilder({ page }).analyze();

      const critical = violations.filter((v) => v.impact === 'critical').map((v) => `${v.id}: ${v.help}`);
      expect(critical).toEqual([]);
    });
  }
});
