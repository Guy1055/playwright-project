# Prompt notes

## MCP Playwright vs. built-in browser (CAT-05, category filter)

**Prompt (summary):** pull + read CLAUDE.md/TEST-PLAN.md; verify Playwright MCP tools exist (stop if not);
explore CAT-05 using *only* MCP tools and note locators / filter behavior / edge cases; write the test via the
`write-playwright-test` skill with a page object; run `CI=1 npx playwright test <file> --retries=0 --repeat-each=3`;
document the MCP-vs-built-in difference; commit + push per CLAUDE.md rules.

**What worked well with MCP**
- Every action prints the real Playwright code it ran (`page.locator('[data-test="category-..."]').click()`), so locators transfer straight into the page object.
- `browser_snapshot` gives an accessibility tree with roles/names: ideal for choosing `getByRole` locators.
- `browser_run_code_unsafe` ran a whole scenario in one call (check A, check B, uncheck, read names) and returned JSON: much faster than click-by-click.

**What did not work well**
- Snapshots are saved to files, and the first one was taken before Angular finished rendering (nav and filters missing): needed a second snapshot.
- The full tree is huge (~400 lines per page), costs tokens; `run_code` with a targeted return value is cheaper.
- Ref ids (`e119`) are tied to one snapshot; real locators must still be written by hand.
- MCP leaves `.playwright-mcp/` junk in the repo: added to `.gitignore`.

**Vs. built-in browser:** the built-in browser is closer to what a human sees (screenshots, coordinates) and is fine for a quick look, but gives no code and no stable locators. MCP is the better tool for *test authoring*.

**Findings about the feature**
- Category filter is a checkbox tree (parent + sub-categories) in the sidebar, no URL change, no total count shown.
- Multiple checked sub-categories = union. Checking a parent ("Hand Tools") checks all its children.
- Clearing all filters returns the full catalog (9 per page + pagination).
- Product names in cards are whitespace-padded: trim before comparing.
