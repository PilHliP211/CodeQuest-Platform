---
name: eslint-rules
description: ESLint configuration, rule rationale, and what to do when a rule fires. Load when seeing lint errors or modifying eslint.config.js.
---

# ESLint Rules

Config: `eslint.config.js` (flat config, ESLint v9+).
Base: `typescript-eslint/strictTypeChecked` + `stylisticTypeChecked`.

## Critical Rules (Project-Specific)

| Rule | Why It Matters |
|------|---------------|
| `no-console` (allow `warn`/`error`) | Prevents accidental debug logs reaching production |
| `@typescript-eslint/strict-boolean-expressions` | Prevents `if (str)` when you meant `if (str.length > 0)` |
| `@typescript-eslint/switch-exhaustiveness-check` | Adding a union variant becomes a compile error in every switch |
| `@typescript-eslint/no-floating-promises` | Unhandled promise rejections are silent bugs |
| `@typescript-eslint/no-misused-promises` | Catches `if (asyncFn())` and similar |
| `@typescript-eslint/explicit-function-return-type` | Makes function contracts visible |
| `eqeqeq` | `==` is a bug factory; `===` only |
| `no-var` / `prefer-const` | Modern JS only |
| `curly: all` | Always use braces — prevents dangling-else |

## When a Rule Fires

**Do not add `eslint-disable` comments.** Fix the underlying code instead.

Common scenarios:

| Error | Fix |
|-------|-----|
| `no-floating-promises` | `await` it, or `void promiseExpr` if intentionally fire-and-forget |
| `strict-boolean-expressions` on string | Use `str.length > 0` or `str !== ''` |
| `strict-boolean-expressions` on nullable | Use `value !== null && value !== undefined` or `value != null` (the only allowed `!=`) |
| `no-unused-vars` on intentional unused | Prefix with underscore: `_unused` |
| `switch-exhaustiveness-check` | Add missing case, or add `default` with `assertNever(value)` |
| `explicit-function-return-type` | Add the return type — even `void` |

## The `--max-warnings=0` Policy

Pre-commit hooks run ESLint with `--max-warnings=0`. **Warnings are commit-blocking.** There is no "warning" tier in this project — every rule is at error severity in practice.

## Adding New Rules

New rules require justification in the PR description. Removing rules requires a stronger justification. The default is to keep the strict baseline.
