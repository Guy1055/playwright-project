---
name: commit-message
description: Write a git commit message in a fixed team format. Use when the user asks to write, suggest, or improve a commit message, or says "commit" and wants help wording it.
---

# Commit message writer

Look at the staged changes (`git diff --staged`) and write one commit message.

## Format
```
<type>: <short summary, max 60 chars, imperative mood>

<body: what and why, wrapped at 72 chars>
```

Allowed types: `feat`, `fix`, `test`, `docs`, `chore`, `refactor`.

## Rules
- Summary in English, imperative ("add login test", not "added").
- No trailing period in the summary.
- Use `test:` for changes that only touch tests.
- If the staged diff is empty, say so and stop. Do not invent changes.
- each commit description body ends with a counter according to other commits (incrementing for all project)

See [examples.md](examples.md) for good and bad messages.
