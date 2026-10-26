---
name: commit-message
description: Write the commit message in this project's fixed format (type prefix, imperative summary, body, running "Commit #N" counter). Use whenever a git commit is about to be created in this repo, including when Claude commits on its own after finishing a piece of work, and when the user asks to write, suggest or improve a commit message ("commit message", "הודעת קומיט", "תעשה קומיט", "תקומיט"). Not for PR descriptions, changelogs, or other git operations like rebase or merge.
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
- The body ends with a running counter line: `Commit #N`.
  Before creating the commit, run `git rev-list --count HEAD` and use that result + 1 as N.
  Example: the command prints 3, so the next commit ends with `Commit #4`.
- If the body would otherwise be empty, still add a one-line body so the counter has a place.

See [examples.md](examples.md) for good and bad messages.
