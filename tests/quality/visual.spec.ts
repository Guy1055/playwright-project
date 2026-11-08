import { test, expect } from '../../fixtures/test';

/**
 * Screenshots are per-OS, so baselines exist for the local machine only and CI skips @visual.
 * Only form regions are compared: the catalog and banners change on the shared demo.
 */
test.describe('Visual regression', { tag: '@visual' }, () => {
  for (const { name, path, region } of [
    { name: 'login-form', path: '/auth/login', region: 'login-form' },
    { name: 'forgot-password-form', path: '/auth/forgot-password', region: 'forgot-password-form' },
  ]) {
    test(`VIS-01: ${name} matches the baseline`, async ({ page }) => {
      await page.goto(path);
      const form = page.getByTestId(region);
      await form.waitFor();

      await expect(form).toHaveScreenshot(`${name}.png`, { maxDiffPixelRatio: 0.01, animations: 'disabled' });
    });
  }
});
