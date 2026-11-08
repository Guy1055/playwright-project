import { defineConfig, devices } from '@playwright/test';
import { API_URL, BASE_URL } from './support/env';

const isCI = !!process.env.CI;
const proxyServer = process.env.HTTPS_PROXY;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  // Shared public demo: keep the load low even in the full suite.
  workers: isCI ? 2 : 3,
  timeout: 45_000,
  reporter: isCI ? [['blob'], ['list']] : [['html', { open: 'never' }], ['list']],
  // Screenshot baselines are OS-specific and only kept for the local machine.
  grepInvert: isCI ? /@visual/ : undefined,

  use: {
    headless: isCI || !!process.env.HEADLESS, // headed locally to watch runs, unless HEADLESS=1
    baseURL: BASE_URL,
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    extraHTTPHeaders: { accept: 'application/json' },
    // Corporate network: Chromium ignores HTTPS_PROXY, so pass it explicitly.
    proxy: proxyServer ? { server: proxyServer, bypass: process.env.NO_PROXY } : undefined,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
      testIgnore: /tests[\\/](api|db)[\\/]/,
    },
    {
      // No browser needed; request fixture only.
      name: 'api',
      testMatch: /tests[\\/](api|db)[\\/].*\.spec\.ts/,
      use: { baseURL: API_URL },
    },
  ],
});
