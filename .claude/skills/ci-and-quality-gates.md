---
name: ci-and-quality-gates
description: The deterministic checks that must pass before code merges. Load when adding scripts, modifying CI, or debugging a failing check.
---

# CI and Quality Gates

The project enforces code quality through deterministic checks. There are no "please remember to" rules — every standard is automated.

## The Gates

| Gate | Command | What It Catches |
|------|---------|----------------|
| Lint | `npm run lint` | Style, common bugs, type-aware rules |
| Type Check | `npx tsc --noEmit` | Type errors |
| Unit + Component Tests | `npm run test` | Behavior regressions (Vitest) |
| Format | `npm run format:check` | Style drift from Prettier |
| Build | `npm run build` | Anything the above missed + bundling errors |
| E2E (CI only, separate job) | `npm run test:e2e` | Cross-subsystem breakage in the golden-path journey |

All gates must pass:
- Locally before pushing (E2E only for stories that touch a critical flow)
- In pre-commit hook (lint + format on staged files)
- In GitHub Actions CI (full suite + E2E, on every PR)

See the `testing-strategy` skill for what to test, and `unit-tests` / `component-tests` / `e2e-tests` / `invariant-tests` for how.

## CI Workflow

`.github/workflows/ci.yml` runs on every push and PR. The primary job:

```yaml
- npm ci
- npm run lint
- npx tsc --noEmit
- npm run test          # Vitest (unit + component + invariant)
- npm run format:check
- npm run build
```

In that order. First failure stops the run. A parallel `e2e` job runs `npm run test:e2e` (Playwright) after the build succeeds.

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
