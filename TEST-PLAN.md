# Test Plan - Toolshop (practicesoftwaretesting.com)

## 1. Scope
**In scope:** every customer flow (catalog, search, filters/sort, product, comparison, rentals, cart, checkout, auth, contact, account area), the admin area, the public REST API, and database checks (SQL written against the real schema, skipped unless `DB_URL` is set).
**Safety on a shared demo:** writes only on records the test created, cleaned up afterwards. Seed data is never modified. Negative login tests use a freshly registered user, because failures lock the shared demo accounts.
**Out of scope:** payment-provider internals, performance/load, mobile layouts, languages other than EN, third-party links (courses, GitHub), chat widget.
**Environment:** public demo, Angular 20, Chromium desktop, `data-test` attribute used as test id. The catalog loads through HTTP `QUERY` with the filters in the body. The demo resets itself periodically, so ids change and test-created data disappears.

## 2. Site map
| Area | URL | Key test ids |
|---|---|---|
| Home / catalog | `/` | `search-query`, `search-submit`, `search-reset`, `sort`, `filters`, `product-name`, `product-price`, `out-of-stock`, `pagination-next`, `compare-btn`, `eco-friendly-filter` |
| Category | `/category/<name>` | `nav-categories`, `nav-hand-tools`, `nav-power-tools`, `nav-other`, `nav-special-tools`, `nav-rentals` |
| Product | `/product/<id>` | `add-to-cart`, `quantity`, `increase-quantity`, `decrease-quantity`, `unit-price`, `add-to-favorites`, `add-to-compare`, `spec-row` |
| Comparison | `/comparison` | `comparison-table`, `remove-product`, `clear-comparison`, `comparison-empty` |
| Rentals | `/rentals` | `page-title`, `product-<id>` |
| Cart / checkout | `/checkout` | `product-title`, `product-quantity`, `line-price`, `cart-total`, `proceed-1`, `proceed-2`, `proceed-2-guest`, `proceed-3`, `payment-method`, `finish`, `payment-success-message` |
| Auth | `/auth/login`, `/auth/register`, `/auth/forgot-password` | `email`, `password`, `login-submit`, `login-error`, `register-submit`, `forgot-password-submit` |
| Contact | `/contact` | `first-name`, `last-name`, `email`, `subject`, `message`, `attachment`, `contact-submit`, `*-error` |
| Account | `/account`, `/account/profile`, `/favorites`, `/invoices`, `/messages` | `nav-profile`, `update-profile-submit`, `change-password-submit`, `totp-*`, `delete`, `invoice-number`, `reply-submit` |
| Admin | `/admin/*` | `<entity>-add`, `<entity>-search-*`, `<entity>-edit-<id>`, `<entity>-delete-<id>`, `<entity>-submit`, `order-status`, `update-status-submit` |

## 3. Scenarios
P1 = core, tagged `@sanity`. P2 = full suite. Ids appear in the test titles.

| Area | Ids | Priority | Covers |
|---|---|---|---|
| Catalog | CAT-01, 02 | P1 | Listing, search |
| Catalog | CAT-03 to 11 | P2 | Empty state, sort, category/brand/eco/price filters, pagination, out of stock, search reset |
| Navigation | NAV-01, 02 | P2 | Category menu, top links |
| Rentals, privacy | RNT-01, PRV-01 | P2 | Page content |
| Product | PRD-01 | P1 | Name, price, description |
| Product | PRD-02 to 07 | P2 | Quantity, related, specs, favorites |
| Comparison | CMP-01 to 04 | P2 | Add, remove, clear, empty |
| Cart | CRT-01, 02 | P1 | Add, totals |
| Cart | CRT-03 to 06 | P2 | Change quantity, remove, continue shopping, no cart |
| Checkout | CHK-01 | P1 | Logged-in order |
| Checkout | CHK-02 to 06 | P2 | Guest order, address and guest validation, all 5 payment methods, invalid payment data |
| Auth | AUTH-01, 02 | P1 | Register, login |
| Auth | AUTH-03 to 13 | P2 | Wrong password, lockout, validation, duplicate email, logout, route guards, forgot password |
| Contact | CON-01 to 07 | P2 | All subjects, validation, attachments, logged-in form |
| Account | ACC-01 to 12 | P2 | Overview, profile, password, two-factor, favorites, invoices, messages |
| Admin | ADM-01 to 06 | P2 | Menu, guards, dashboard, reports, settings |
| Admin | ADM-10 to 33 | P2 | Brands, categories, products (add, edit, search, delete) |
| Admin | ADM-40 to 62 | P2 | Orders, users, messages |
| API | API-* | P1 subset, else P2 | All 81 operations in the OpenAPI document, including permissions and validation |
| Database | DB-01 to 06, 10 to 20 | P2 | Writes reach the tables; integrity rules (placeholder tier) |
| Quality | A11Y-01, VIS-01 | P2 | axe-core on public pages; screenshots of stable forms (local only) |

## 4. Known defects
Documented with `test.fail`, so the test goes red the day the site is fixed.

| Id | Defect | Test |
|---|---|---|
| BUG-01 | Duplicate brand slug: API answers 409 but the form shows no error | ADM-11 |
| BUG-02 | Admin "add user" answers 500 when failed-login and enabled are left empty | worked around in `AdminFormPage` |
| BUG-03 | Admin product edit does not prefill stock, brand, category or image | worked around in ADM-31 |
| BUG-04 | `POST /payment/check` answers 200 for an unknown payment method | API-PAY-02 |
| BUG-05 | `PUT` and `PATCH /invoices/{id}` answer 404 for an existing invoice | API-INV-11, 12 |
| BUG-06 | API registers a user with a malformed email | API-USR-03b |
| BUG-07 | Show/hide password button has no accessible name | A11Y-01 login, register |
| BUG-08 | `/checkout` with no cart renders an empty page and floods the console with errors | observed, no test |

## 5. Test data
- Customers: registered through the API per test with a unique email, removed afterwards where possible.
- Admin: the demo account the site publishes. Its password is public, so it has a default in `support/env.ts` and can be overridden by env var.
- Products: resolved at runtime through the API, never by hard-coded id.
- Address: fake but valid-format. The API requires city and state to match the postcode lookup, so API tests read them from `/postcode-lookup`.
- Payment: only the demo payment methods, with obviously fake numbers.

## 6. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Shared public demo: data and stock change | Compare UI with the API at runtime; don't assert on exact catalog contents |
| The demo resets itself during a run | `retries: 2` in CI; Claude's failure analysis separates this noise from regressions |
| Generated ids in URLs | Resolve ids at runtime |
| Locking the shared accounts | Negative login tests use throwaway users only |
| Load on a public service | 3 workers locally, 2 per shard in CI |
| Corporate proxy | Proxy passed explicitly in `playwright.config.ts` |
| No DB access on the demo | SQL tier skips unless `DB_URL` is set |

## 7. Entry / exit criteria
- Entry: site reachable, `npm ci` and browsers installed.
- Exit: `@sanity` green on every push; full suite green nightly apart from demo resets.
