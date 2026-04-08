---
name: dependency-policy
description: Rules for adding new npm dependencies. Load when considering installing a package.
---

# Dependency Policy

## Default Answer: No

Every dependency adds bundle size, attack surface, and maintenance burden. The bundle ships to kids on potentially slow connections. Each kilobyte counts.

Before adding a dependency, ask:
1. Can this be done with the standard library or existing deps?
2. Is the package actively maintained?
3. What's the bundle size impact (check on bundlephobia)?
4. Does it pull in transitive deps we'd otherwise avoid?

## Approved Dependencies (v1)

The full v1 dependency list is small and intentional:

**Runtime:**
- `react`, `react-dom`
- `blockly`
- `monaco-editor` (or `@monaco-editor/react`)
- `acorn` (parser for player code)
- `tailwindcss`

**Dev:**
- `vite`, `@vitejs/plugin-react`
- `typescript`, `typescript-eslint`
- `eslint`, `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `eslint-config-prettier`
- `prettier`
- `husky`, `lint-staged`
- Test runner (TBD: `vitest` likely)

## Adding a New Dependency

Requires:
1. Justification in the PR description (what it solves, alternatives considered, bundle size)
2. Pinned version (no `^` or `~` in `package.json` for runtime deps)
3. License check — MIT, Apache-2.0, BSD, ISC are fine. Anything else needs discussion.

## What Not to Pull In

- jQuery, Lodash (prefer modern JS)
- Moment.js (use `Intl` APIs)
- Heavy UI libraries (Material UI, Ant Design) — Tailwind handles styling
- State management libraries (Redux, MobX) — Context + useReducer is sufficient for v1
- HTTP clients (axios) — `fetch` is built in
- Form libraries (Formik, React Hook Form) — v1 forms are simple
- Validation libraries (Zod, Yup) — handwritten type guards keep bundle small. Revisit if validation grows complex.
