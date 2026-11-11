# Project: Playwright QA automation with Claude

## Goal
Portfolio project for QA Automation roles: test plan, Playwright tests, Claude skills,
a dynamic workflow that generates tests, and Claude running in GitHub Actions CI.
Progress is tracked in CHECKLIST.md file.

## System under test
https://practicesoftwaretesting.com (Toolshop, a public demo app built for test practice).
- UI: Angular. API docs are linked from the site.
- Scope: every customer flow, the admin area and the public API, using the demo accounts the site publishes.
- Shared public site: writes only on records the test created itself, then clean up. Never modify or delete seed data, and never call the database reset endpoint (`/refresh`).
- Never run negative login tests against the shared demo accounts (`admin@`, `customer@`): repeated failures lock them. Use a user the test registered.
- Use test accounts only; never real personal data.

## Conventions
- Playwright + TypeScript, Page Object Model under `pages/`, tests under `tests/`.
- Prefer role/label/test-id locators over CSS/XPath.
- No hard-coded sleeps; rely on auto-waiting and web-first assertions.
- Traces: `on-first-retry`.
- Work machine is behind a corporate proxy: the config passes HTTPS_PROXY to Chromium explicitly.
- Secrets (e.g. ANTHROPIC_API_KEY) only via env vars / GitHub Secrets, never committed.

## Git workflow (solo personal project)
- Work directly on `main`. No feature branches, no PRs.
- After each small, working piece of a feature: commit and push straight away, without asking.
- Many small commits are preferred over big ones. Use the `commit-message` skill for wording.
- Stage files by explicit path, never `git add -A` or `git add .`.
- Before every commit: run `git status`. Before every push: run `git diff --stat origin/main` and check for junk, secrets, `.env`, large or unexpected files.
- Tests: run only the tests related to the change before pushing; the full suite runs in CI (see the tiers in the testing notes).
- Never force-push; never rewrite history already pushed.
- At the start of each session run `git pull --rebase origin main`.
- If a push is rejected: `git pull --rebase origin main`, then push again.
- If the rebase hits a conflict: stop and show the user, do not resolve it alone.

## Language
User is Hebrew-speaking: explain in Hebrew, keep code and identifiers in English.

## Communication style (this project is for learning)
- Routine or unimportant things (status, small edits, commands that ran fine): very brief, a line or two.
- Learning-relevant concepts (why a tool works a certain way, trade-offs, new mechanics): explain clearly, but only the core idea.
- Do not pad: no recaps of what the user just said, no side topics, no listing options you will not pursue.
- Do not volunteer long explanations. After a short explanation, offer a deeper one in a single line ("רוצה שארחיב על X?") and wait.
- Give a recommendation, not a survey of options.

## Testing notes
- Tag tests with `{ tag: "@sanity" }` (broad core coverage, fast enough for every push); everything else runs only in the full suite. Other tags: `@api`, `@db` (skips without `DB_URL`), `@a11y`, `@visual` (local only).
- A real site defect uses `test.fail` with a BUG id from `TEST-PLAN.md`.
- Sister project in Selenium Java: `../selenium-java-project`. A new scenario goes into both, under the same id.
- Local, per change: run only the affected spec file(s).
- On every push (CI, step 5): `npx playwright test --grep @sanity`.
- Full suite: in CI on a nightly schedule and manually, parallel/sharded.

## Current status (update at the end of each session)
- Done: whole-site automation (customer UI, admin, API for all 81 operations, SQL placeholders, a11y, visual), page objects under `pages/`, fixtures, `TEST-PLAN.md` with 8 known site defects.
- Done: Playwright MCP, trace practice spec and guide, dynamic workflow `.claude/workflows/generate-tests.js`, CI with sanity on push, nightly sharded full suite and Claude failure analysis, README.
- Done: sister project in Selenium Java (`Guy1055/selenium-java-project`).
- Done: two code-review rounds on the whole suite (fixtures, API helpers, cleanup, shared helpers in `ToolshopApi`); CI sanity green on `8f0bcdc`. Locally the public demo can show a Cloudflare check after heavy runs: that is not a test bug.
- Left for the user: add `ANTHROPIC_API_KEY` to GitHub Secrets, run `/generate-tests` on a real feature, the skill auto-activation check in a new session, prompt practice, reading a trace, LinkedIn post, interview prep. See `CHECKLIST.md`.
- Environment notes: Windows, Git Bash and PowerShell. Python is NOT installed: use Node or shell tools for scripts. Run tests with `npx playwright test` (add `--grep @sanity` for the sanity tier).
- Commit messages end with `Commit #N` where N = `git rev-list --count HEAD` + 1 (see the `commit-message` skill).
