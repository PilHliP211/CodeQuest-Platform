# CodeQuest Platform

Gamified coding education for kids 8-12. Static React app, no backend. All lesson content lives in JSON content packs under `content/`, never in platform code.

## Commands

```
npm run dev          # Dev server
npm run build        # Production build
npm run lint         # ESLint (strict, type-checked)
npm run test         # Vitest (unit + component + invariant)
npm run test:e2e     # Playwright (critical journeys only)
npm run format:check # Prettier check
npx tsc --noEmit     # Type check
```

All gates must pass before committing: `lint`, `tsc --noEmit`, `test`, `format:check`, `build`. `test:e2e` runs in CI on every PR.

## AI Tooling

Claude and Codex use the same project guidance:

- Claude loads `CLAUDE.md`
- Codex loads `AGENTS.md`
- Shared skill docs live in `.claude/skills/`

Keep `CLAUDE.md` and `AGENTS.md` semantically identical; update both when AI-agent guidance changes.

## Hard Rules

1. No `any` — use `unknown` + type guards
2. No `eval()` or `Function()` — player code uses the AST interpreter
3. No hardcoded lesson content — belongs in content pack JSON
4. No `console.log` — linter enforces `warn`/`error` only
5. No `eslint-disable` — fix the code
6. Tests assert on outcomes a learner can observe, never on internal mechanics — see `.claude/skills/testing-strategy.md`
7. Every remaining epic must include a human-testable `npm run dev` increment with automated coverage — see `.claude/skills/human-testable-increments.md`

## Where to Find Things

| What | Where |
|------|-------|
| Code patterns & standards | `.claude/skills/` (shared by Claude and Codex) |
| Architecture & tech stack | `docs/ARCHITECTURE.md` |
| Content pack JSON schema | `docs/CONTENT_SCHEMA.md` |
| Product requirements | `docs/PRD.md` |
| Epics & roadmap | `docs/EPICS.md`, `docs/ROADMAP.md` |
| Implementation tickets | `docs/stories/E-*/` |
