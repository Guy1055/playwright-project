# Playwright QA Automation with Claude

End-to-end automation of [Toolshop](https://practicesoftwaretesting.com), a public demo store built for test practice: the customer journeys, the admin area, the whole REST API, and database checks. Claude Code took part in building it through project skills, the Playwright MCP, a dynamic workflow and CI failure analysis.

A sister project implements the same scenarios in Selenium + Java: [selenium-java-project](https://github.com/Guy1055/selenium-java-project).

## What is covered
| Layer | Where | Notes |
|---|---|---|
| UI, customer | `tests/*.spec.ts` | Catalog, product, comparison, cart, checkout (5 payment methods, guest), auth, contact, account |
| UI, admin | `tests/admin/` | Menu, reports, brands, categories, products, orders, users, messages |
| API | `tests/api/` | All 81 operations in the OpenAPI document, with permissions and validation |
| Database | `tests/db/`, `db/` | SQL against the real schema. The public demo exposes no database, so these skip locally unless `DB_URL` is set; CI runs them against a private instance |
| Quality | `tests/quality/` | axe-core accessibility, screenshot regression (local only) |

Details, scenario ids and the 8 defects found in the site are in [TEST-PLAN.md](TEST-PLAN.md).

## Architecture
```
pages/      Page Objects (pages/admin/ for the back office)
api/        ToolshopApi: thin client over the REST API
db/         DbClient and the SQL queries
fixtures/   Throwaway customer per test, admin token per worker, token seeding, DB connection
support/    Environment and test data
tests/      Specs by area
.claude/    Skills (commit-message, write-playwright-test) and the generate-tests workflow
```

### Decisions worth explaining
- **The API is the source of truth.** Catalog data changes on a shared demo, so sort and filter tests compare the UI to the API at runtime.
- **Fixtures sign in by seeding the token,** so only the login tests pay for the login form.
- **Writes touch only records the test created.** Negative login tests use throwaway users, because failures lock the shared demo accounts.
- **Known site defects use `test.fail`.** The suite stays green, the defect stays documented, and the test goes red the day it is fixed.

## Running
```bash
npm ci
```
```bash
npx playwright install chromium
```
```bash
npx playwright test
```
```bash
npx playwright test --grep @sanity
```
```bash
npx playwright test --project=api
```
Runs are headed locally; set `HEADLESS=1` for headless.

| Env var | Purpose |
|---|---|
| `HEADLESS` | Headless local run |
| `BASE_URL`, `API_URL` | Target another environment |
| `DB_URL` | Enable the SQL tier, e.g. `mysql://user:root@localhost:3306/toolshop` against a self-hosted Toolshop |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | Override the public demo admin |
| `HTTPS_PROXY`, `NO_PROXY` | Corporate proxy |

## CI
[`.github/workflows/playwright.yml`](.github/workflows/playwright.yml):
- The public site shows a Cloudflare check to data-center IPs, so CI starts a private copy of Toolshop in Docker and tests that. This also gives the SQL tier a real database.
- `@sanity` on every push; the full suite nightly and on demand, in shards, merged into one HTML report.
- Traces, reports and failure output are kept as artifacts.
- When a run fails, Claude analyses the results read-only and writes the likely cause per failure to the run summary. It needs the `ANTHROPIC_API_KEY` secret and skips cleanly without it.

## Claude Code in this project
- **Skills:** `.claude/skills/` hold the commit format and test-writing conventions.
- **Playwright MCP:** used to explore the live site and verify locators.
- **Dynamic workflow:** `/generate-tests <feature>` drafts cases, loops through a critic, writes code and fixes it. See [docs/DYNAMIC-WORKFLOW.md](docs/DYNAMIC-WORKFLOW.md).
- **Trace practice:** [docs/TRACE-GUIDE.md](docs/TRACE-GUIDE.md).
