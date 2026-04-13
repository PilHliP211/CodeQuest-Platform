# Skills Index

These are focused guidance documents for AI coding agents working on CodeQuest. They are shared by Claude and Codex through `CLAUDE.md` and `AGENTS.md`. Each skill is a single concern. Load only what's relevant to the current task.

## Standards

| Skill | When to Load |
|-------|-------------|
| `typescript-standards` | Writing/modifying any `.ts`/`.tsx` |
| `eslint-rules` | Lint errors or modifying `eslint.config.js` |
| `formatting` | Before committing |
| `naming-conventions` | Creating new files or symbols |
| `accessibility` | Building UI |
| `ci-and-quality-gates` | Touching scripts, CI, or debugging failures |
| `dependency-policy` | Considering a new npm package |

## Patterns

| Skill | When to Load |
|-------|-------------|
| `react-component-structure` | Creating or modifying React components |
| `react-context-pattern` | Creating or consuming a context |
| `localstorage-pattern` | Adding persistent state |
| `error-handling` | Designing error states or handling failures |

## Architecture

| Skill | When to Load |
|-------|-------------|
| `architecture-overview` | Navigating the codebase, deciding where code goes |
| `content-pack-system` | Anything touching lessons, narrative, blocks, or canvas API |
| `security-rules` | Working on the interpreter, sandbox, or player code path |

## Testing (Outcome-Focused Validation)

Start with `testing-strategy` — it defines the philosophy every other testing skill implements.

| Skill | When to Load |
|-------|-------------|
| `testing-strategy` | **Required** before any story producing executable code or behavior |
| `unit-tests` | Writing Vitest tests for pure logic, stores, parsers, state machines |
| `component-tests` | Writing Testing Library tests for React components |
| `e2e-tests` | Writing Playwright tests for critical end-to-end learner journeys |
| `invariant-tests` | Writing fast-check property tests for the interpreter sandbox or content pack validator |

## Cross-Cutting

| Skill | When to Load |
|-------|-------------|
| `human-testable-increments` | Creating or updating epics/stories so every epic ends in an `npm run dev`-visible behavior change with automated coverage |
| `anti-patterns` | Quick "what not to do" reference |
