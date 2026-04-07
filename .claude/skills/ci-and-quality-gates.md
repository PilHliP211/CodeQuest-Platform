---
name: ci-and-quality-gates
description: The deterministic checks that must pass before code merges. Load when adding scripts, modifying CI, or debugging a failing check.
---

# CI and Quality Gates

The project enforces code quality through deterministic checks. There are no "please remember to" rules — every standard is automated.

## The Four Gates

| Gate | Command | What It Catches |
|------|---------|----------------|
| Lint | `npm run lint` | Style, common bugs, type-aware rules |
| Type Check | `npx tsc --noEmit` | Type errors |
| Format | `npm run format:check` | Style drift from Prettier |
| Build | `npm run build` | Anything the above missed + bundling errors |

All four must pass:
- Locally before pushing
- In pre-commit hook (lint + format on staged files)
- In GitHub Actions CI (full suite, on every PR)

## CI Workflow

`.github/workflows/ci.yml` runs on every push and PR. The job is:

```yaml
- npm ci
- npm run lint
- npx tsc --noEmit
- npm run format:check
- npm run build
```

In that order. First failure stops the run.

## Pre-Commit Hook

Husky + lint-staged run on staged files only (fast):

```json
{
  "src/**/*.{ts,tsx}": ["eslint --max-warnings=0", "prettier --check"],
  "src/**/*.{json,css}": ["prettier --check"]
}
```

`--max-warnings=0` means warnings are commit-blocking. There is no "warning" tier.

## When a Check Fails

| Failure | Likely Fix |
|---------|-----------|
| `lint` fails | Run `npm run lint:fix`, then fix what auto-fix can't |
| `tsc` fails | Read the error; add a missing type or fix the bug |
| `format:check` fails | Run `npm run format` |
| `build` fails | Likely an import error or type error tsc missed; investigate |

## Don't

- Don't add commands that bypass CI (`--no-verify`, `--force`)
- Don't disable rules to make CI green
- Don't skip the local checks and rely on CI
- Don't add new commands to the CI pipeline without updating this skill
