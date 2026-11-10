import { test, expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';

/**
 * Fails on purpose, for practising the Trace Viewer (see docs/TRACE-GUIDE.md).
 * Skipped unless TRACE_DEMO=1, so it never affects a normal run.
 */
test('DEMO: a deliberately failing test to read in the Trace Viewer', async ({ page }) => {
  test.skip(!process.env.TRACE_DEMO, 'Set TRACE_DEMO=1 to run this demo');
  const home = new HomePage(page);
  await home.goto();
  await home.search('hammer');

  // Wrong on purpose: "hammer" returns several products.
  await expect(home.productNames).toHaveCount(1);
});
