# Project: Playwright QA automation with Claude

## Goal
Portfolio project for QA Automation roles: test plan, Playwright tests, Claude skills,
a dynamic workflow that generates tests, and Claude running in GitHub Actions CI.
Progress is tracked in CHECKLIST.md.

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
- Secrets (e.g. ANTHROPIC_API_KEY) only via env vars / GitHub Secrets, never committed.

## Git workflow (solo personal project)
- Work directly on `main`. No feature branches, no PRs.
- After each small, working piece of a feature: commit and push straight away, without asking.
- Many small commits are preferred over big ones. Use the `commit-message` skill for wording.
- Before every push: `git status` clean of junk, no secrets, tests pass if any exist.
- Never force-push; never rewrite history already pushed.
- At the start of each session run `git pull --rebase origin main`.
- If a push is rejected: `git pull --rebase origin main`, then push again.
- If the rebase hits a conflict: stop and show the user, do not resolve it alone.

## Language
User is Hebrew-speaking: explain in Hebrew, keep code and identifiers in English.
