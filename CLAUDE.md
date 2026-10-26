# Project: Playwright QA automation with Claude

## Goal
Portfolio project for QA Automation roles: test plan, Playwright tests, Claude skills,
a dynamic workflow that generates tests, and Claude running in GitHub Actions CI.
Progress is tracked in CHECKLIST.md file.

## System under test
https://practicesoftwaretesting.com (Toolshop, a public demo app built for test practice).
- UI: Angular. API docs are linked from the site.
- Only exercise flows that a normal user could (browse, search, cart, checkout, login, register).
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
- Tag tests with `{ tag: "@sanity" }` (broad core coverage, fast enough for every push); everything else is untagged and runs only in the full suite.
- Local, per change: run only the affected spec file(s).
- On every push (CI, step 5): `npx playwright test --grep @sanity`.
- Full suite: in CI on a nightly schedule and manually, parallel/sharded.
