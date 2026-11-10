export const BASE_URL = process.env.BASE_URL ?? 'https://practicesoftwaretesting.com';
export const API_URL = process.env.API_URL ?? 'https://api.practicesoftwaretesting.com';

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[]\]/g, '\/** Matches the storefront');
}

/** Matches the storefront's home page URL on whichever environment is under test. */
export const HOME_URL = new RegExp(`^${escapeRegExp(BASE_URL)}/?$`);

/**
 * Admin account the site publishes for practice (see the Toolshop README).
 * It is public, so it is not a secret; env vars allow pointing at another environment.
 */
export const DEMO_ADMIN = {
  email: process.env.ADMIN_EMAIL ?? 'admin@practicesoftwaretesting.com',
  password: process.env.ADMIN_PASSWORD ?? 'welcome01',
};

/** Connection string for the database tier, e.g. mysql://user:root@localhost:3306/toolshop. */
export const DB_URL = process.env.DB_URL;

/** Corporate network: Chromium ignores HTTPS_PROXY, so pass it explicitly. */
export function proxyOptions() {
  const server = process.env.HTTPS_PROXY;
  return server ? { server, bypass: process.env.NO_PROXY } : undefined;
}
