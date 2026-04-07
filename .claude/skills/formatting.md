---
name: formatting
description: Prettier configuration. Load when formatting questions arise or before committing changes.
---

# Formatting

Prettier handles all formatting. Do not hand-tune whitespace, semicolons, or line breaks.

## Config (`.prettierrc`)

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2,
  "arrowParens": "always",
  "endOfLine": "lf"
}
```

## Commands

```
npm run format       # Format all source files
npm run format:check # CI mode — fails if anything would change
```

## Rules of Engagement

- Run `npm run format` after any non-trivial edit.
- Pre-commit hooks run `prettier --check` on staged files. They do not auto-format — they fail the commit. Run `npm run format` first.
- ESLint is configured with `eslint-config-prettier` to disable formatting rules that conflict with Prettier. ESLint never fights Prettier.
- Markdown files are excluded (`.prettierignore`). Hand-format prose.
