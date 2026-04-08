# CodeQuest Platform

Gamified coding education for kids 8-12. Static React app, no backend. All lesson content lives in JSON content packs under `content/`, never in platform code.

## Commands

```
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint (strict, type-checked)
npm run format:check # Prettier check
npx tsc --noEmit     # Type check
```

All four must pass before committing: `lint`, `tsc --noEmit`, `format:check`, `build`.

## Hard Rules

1. No `any` — use `unknown` + type guards
2. No `eval()` or `Function()` — player code uses the AST interpreter
3. No hardcoded lesson content — belongs in content pack JSON
4. No `console.log` — linter enforces `warn`/`error` only
5. No `eslint-disable` — fix the code

## Where to Find Things

| What | Where |
|------|-------|
| Code patterns & standards | `.claude/skills/` |
| Architecture & tech stack | `docs/ARCHITECTURE.md` |
| Content pack JSON schema | `docs/CONTENT_SCHEMA.md` |
| Product requirements | `docs/PRD.md` |
| Epics & roadmap | `docs/EPICS.md`, `docs/ROADMAP.md` |
| Implementation tickets | `docs/stories/E-*/` |
