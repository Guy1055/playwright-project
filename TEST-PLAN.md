# Test Plan - Toolshop (practicesoftwaretesting.com)

## 1. Scope
**In scope:** every customer flow (catalog, search, filters/sort, product, comparison, rentals, cart, checkout, auth, contact, account area), the admin area, the public REST API, and database checks (SQL written against the real schema, skipped unless `DB_URL` is set).
**Safety on a shared demo:** writes only on records the test created, cleaned up afterwards. Seed data is never modified. Negative login tests use a freshly registered user, because failures lock the shared demo accounts.
**Out of scope:** payment-provider internals, performance/load, mobile layouts, languages other than EN, third-party links (courses, GitHub), chat widget.
**Environment:** public demo, Angular 20, Chromium desktop, `data-test` attribute used as test id.

## 2. Site map (from exploration)
| Area | URL | Key test ids |
|---|---|---|
| Home / catalog | `/` | `search-query`, `search-submit`, `search-reset`, `sort`, `filters`, `product-name`, `product-price`, `out-of-stock`, `pagination-next/prev` |
| Category | `/category/<name>` | `nav-hand-tools`, `nav-power-tools`, `nav-other`, `nav-special-tools` |
| Product | `/product/<id>` | `add-to-cart`, `quantity`, `increase-quantity`, `decrease-quantity`, `unit-price`, `add-to-favorites` |
| Cart / checkout | `/checkout` | `product-title`, `product-quantity`, `line-price`, `cart-total`, `proceed-1`, `proceed-3`, `payment-method`, `finish` |
| Checkout sign-in | `/checkout` step 2 | `email`, `password`, `login-submit`, `guest-email`, `guest-first-name`, `guest-last-name`, `guest-submit` |
| Address | `/checkout` step 3 | `country`, `postal_code`, `house_number`, `street`, `city`, `state` |
| Register | `/auth/register` | `first-name`, `last-name`, `dob`, `phone`, `email`, `password`, `register-submit` |
| Login | `/auth/login` | `email`, `password`, `login-submit` |

Notes: product and category ids in URLs are generated, so tests must navigate by name/click, not by hard-coded id. The catalog has 8 pages, some items are "Out of stock". A success toast ("Product added to shopping cart.") appears with `role=alert`.

## 3. Scenarios and priorities
P1 = core, tagged `@sanity`. P2 = full suite. P3 = nice to have.

| ID | Scenario | Priority | Tag |
|---|---|---|---|
| CAT-01 | Home shows products with name and price | P1 | @sanity |
| CAT-02 | Search for "hammer" returns only matching products | P1 | @sanity |
| CAT-03 | Search with no results shows an empty-state message | P2 | |
| CAT-04 | Sort by price (low-high) orders prices ascending | P2 | |
| CAT-05 | Filter by category narrows the list | P2 | |
| CAT-06 | Pagination moves to the next page with different products | P2 | |
| CAT-07 | Out-of-stock product cannot be added to cart | P2 | |
| PRD-01 | Product page shows name, price, description | P1 | @sanity |
| PRD-02 | Increase / decrease quantity updates the field (min 1) | P2 | |
| CRT-01 | Add product to cart shows toast and cart badge = 1 | P1 | @sanity |
| CRT-02 | Cart total equals unit price x quantity | P1 | @sanity |
| CRT-03 | Change quantity in cart updates line price and total | P2 | |
| CRT-04 | Remove item from cart empties it | P2 | |
| CHK-01 | Full checkout as logged-in user ends with confirmation | P1 | @sanity |
| CHK-02 | Guest checkout with valid details | P2 | |
| CHK-03 | Required address fields show validation errors | P2 | |
| AUTH-01 | Register new user with valid data, then log in | P1 | @sanity |
| AUTH-02 | Login with valid credentials shows the account page | P1 | @sanity |
| AUTH-03 | Login with wrong password shows an error | P2 | |
| AUTH-04 | Register with invalid email / weak password shows errors | P2 | |
| NAV-01 | Main nav links open the right category pages | P3 | |

## 4. Test data
- Registered test user: create once per run via the UI (or API) with a unique email (`qa+<timestamp>@example.com`); never real personal data. Keep credentials in env vars, not in the repo.
- Products: pick by name ("Combination Pliers", "Hammer") rather than id.
- Address: fake but valid-format values.
- Payment: only the demo payment methods offered by the site.

## 5. Risks and mitigations
| Risk | Mitigation |
|---|---|
| Shared public demo: data and stock can change, site may reset | Don't assert on exact catalog contents; assert on behavior |
| Out-of-stock items are random | Pick a product that is in stock at runtime |
| Generated ids in URLs | Navigate via UI, not stored URLs |
| Rate limits / slow responses | Rely on auto-waiting; `retries: 2` in CI |
| Corporate proxy | Proxy passed explicitly in `playwright.config.ts` |
| Parallel tests sharing a user/cart | Each test creates its own state; no shared mutable data |

## 6. Entry / exit criteria
- Entry: site reachable, `npm ci` and browsers installed.
- Exit: all P1 pass 3 runs in a row locally with no flakiness; P2 pass in the full suite.
