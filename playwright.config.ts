import { defineConfig, devices } from '@playwright/test';

const isCI = !!process.env.CI;
const proxyServer = process.env.HTTPS_PROXY;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: 'html',

  use: {
    baseURL: 'https://practicesoftwaretesting.com',
    testIdAttribute: 'data-test',
    trace: 'on-first-retry',
    // Corporate network: Chromium ignores HTTPS_PROXY, so pass it explicitly.
    proxy: proxyServer ? { server: proxyServer, bypass: process.env.NO_PROXY } : undefined,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
