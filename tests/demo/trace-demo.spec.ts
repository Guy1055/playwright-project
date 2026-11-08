import { test, expect } from '@playwright/test';

/**
 * Fails on purpose, for practising the Trace Viewer (see docs/TRACE-GUIDE.md).
 * Skipped unless TRACE_DEMO=1, so it never affects a normal run.
 */
test('DEMO: a deliberately failing test to read in the Trace Viewer', async ({ page }) => {
  test.skip(!process.env.TRACE_DEMO, 'Set TRACE_DEMO=1 to run this demo');
  await page.goto('/');
  await page.getByTestId('search-query').fill('hammer');
  await page.getByTestId('search-submit').click();
  await page.getByTestId('search_completed').waitFor({ state: 'attached' });

  // Wrong on purpose: "hammer" returns several products.
  await expect(page.getByTestId('product-name')).toHaveCount(1);
});
