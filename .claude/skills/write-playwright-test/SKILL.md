---
name: write-playwright-test
description: Write or extend Playwright (TypeScript) tests for the Toolshop site (practicesoftwaretesting.com) following this project's conventions - Page Object Model under pages/, role/label/test-id locators, web-first assertions, no hard-coded sleeps, @sanity tagging. Use whenever a new spec, page object or test case is about to be created or changed in this repo, including when the user asks to "write a test", "add a test for X", "automate this flow", "תכתוב טסט", "תוסיף טסט", "תאטמט את התרחיש". Not for running tests, debugging traces, CI setup, or writing the test plan itself.
---

# Write a Playwright test

Follow these steps in order. Keep each test small and independent.

## 1. Before writing
- Read an existing spec (e.g. `tests/home.spec.ts`) and any related page object in `pages/` to match style.
- Check the target flow on the live site (or the Test Plan if one exists). Do not guess locators.
- Shared public demo: writes only on records the test created, then clean up. Negative login tests only on a user the test registered. Use test accounts, never real personal data.

## 2. Structure
- Specs live in `tests/<feature>.spec.ts`; page objects in `pages/<Page>Page.ts`.
- One `test.describe` per feature; one behavior per `test`. Test names describe the behavior ("adds a product to the cart"), not the implementation.
- Page objects hold locators and user actions (`search(term)`, `addToCart()`). Assertions stay in the spec, not in the page object.
- Page object skeleton: see [templates.md](templates.md).
- Import `test` from `fixtures/test.ts` when a test needs `api`, `customer`, `customerPage`, `adminPage` or `db`.
- Tests must not depend on each other or on execution order. Set up their own state.

## 3. Locators (priority order)
1. `getByRole` / `getByLabel` / `getByText` (what the user sees)
2. `getByTestId` - this project uses `data-test` (already set via `testIdAttribute`)
3. CSS/XPath only as a last resort, with a comment saying why.

## 4. Waiting and assertions
- No `waitForTimeout` / fixed sleeps. Rely on auto-waiting.
- Use web-first assertions (`await expect(locator).toBeVisible()`, `toHaveText`, `toHaveCount`), never `expect(await locator.isVisible())`.
- Wait for state, not time: `await expect(...)`, or `page.waitForResponse` when a specific request matters.

## 5. Tags
- `{ tag: '@sanity' }` on the `describe` or `test` for core, fast paths that should run on every push. Everything else stays untagged (full suite only).

## 6. Before finishing
- Run only the affected spec: `npx playwright test tests/<file>.spec.ts` and confirm it passes. Run it twice to catch obvious flakiness.
- Do not commit failing or skipped tests, with two exceptions: a real site defect uses `test.fail` with a BUG id from `TEST-PLAN.md`, and the `@db` tier skips without `DB_URL`. Report honestly if something could not be verified.
- A new scenario goes into the Selenium project too, under the same id.
- Commit with the `commit-message` skill; stage files by explicit path.

See [templates.md](templates.md) for a page object and spec template.
