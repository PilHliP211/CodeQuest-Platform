# CodeQuest Platform — Agent Guide

This is the development guide for AI coding agents working on the CodeQuest Platform. It uses progressive disclosure: start with the quick reference, dig deeper only when you need to.

---

## Quick Reference

```
npm run dev          # Start dev server
npm run build        # Production build
npm run lint         # ESLint (strict, type-checked)
npm run lint:fix     # ESLint with auto-fix
npm run format       # Prettier — format all source files
npm run format:check # Prettier — check without writing
npx tsc --noEmit     # TypeScript type check (no output)
```

**Before committing:** All four checks must pass: `lint`, `tsc --noEmit`, `format:check`, `build`. Pre-commit hooks enforce this on staged files.

---

## Project Overview

CodeQuest is a gamified coding education platform for kids aged 8-12. Players chase a villain across the world, solving coding challenges to restore stolen national flags. It's a static React app — no backend.

**Key insight:** The platform is a content-agnostic engine. All lessons, stories, and progression are defined in JSON content packs under `content/`. Platform code never contains hardcoded lesson content.

### Tech Stack

- React 18 + Vite + TypeScript (strict)
- Google Blockly (visual block editor)
- Monaco Editor (syntax editor)
- Custom AST interpreter (acorn parser, sandboxed execution)
- HTML5 Canvas (drawing output)
- Tailwind CSS (Press Start 2P pixel-art font)
- localStorage (persistence)

---

## Architecture (What You Need to Know)

### Directory Layout

```
src/
  engine/         # Core logic: content loading, lesson runner, progress, interpreter
  components/     # React UI components (Profile/, Map/, HUD/, Narrative/, Collection/)
  editor/         # Blockly + Monaco editor wrappers
  renderer/       # Canvas renderer + success evaluator
  types/          # TypeScript type definitions
content/
  flag-hunter/    # First content pack (JSON + assets)
docs/             # Planning documents, epics, stories
```

### Key Architectural Rules

1. **Content drives everything.** If it's lesson-specific, it belongs in a JSON content pack, not in platform code.
2. **No eval, ever.** Player code is parsed to AST (acorn), whitelist-validated, then tree-walked by a custom interpreter. No `eval()`, no `Function()`, no `vm2`.
3. **Inject only what's allowed.** The interpreter receives only the drawing functions declared in the current lesson's `availableFunctions`. Everything else is inaccessible.
4. **localStorage schema is typed.** All keys use the `codequest:` prefix. All reads go through a validation function — never trust raw JSON.parse output.

---

## Code Standards

### TypeScript

- **Strict mode is non-negotiable.** `strict: true` plus `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, and other strict flags. See `tsconfig.json`.
- **No `any`.** Use `unknown` at boundaries and narrow with type guards.
- **Explicit return types on exported functions.** Internal helpers and arrow callbacks can rely on inference.
- **Use discriminated unions for state.** Prefer `{ status: 'loading' } | { status: 'ready', data: T } | { status: 'error', message: string }` over optional fields.

### ESLint

- Config: `eslint.config.js` (flat config, ESLint v9+)
- Rule set: `typescript-eslint/strictTypeChecked` + `stylisticTypeChecked`
- Key rules enforced:
  - `no-console` (except `warn` and `error`)
  - `strict-boolean-expressions` — no truthy/falsy coercion
  - `switch-exhaustiveness-check` — every union member handled
  - `no-floating-promises` — all promises must be awaited or voided
  - `eqeqeq` — `===` only
  - `curly: all` — always use braces

### Formatting

- Prettier handles all formatting. Don't manually adjust whitespace or semicolons.
- Config: `.prettierrc` — single quotes, trailing commas, 100-char width, 2-space indent.

### Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| Files (components) | PascalCase | `NameEntryScreen.tsx` |
| Files (utilities) | camelCase | `profileStore.ts` |
| Files (types) | camelCase | `content.ts` |
| React components | PascalCase | `function WorldMap()` |
| Hooks | camelCase, `use` prefix | `useProfile()` |
| Types/Interfaces | PascalCase | `LearnerProfile` |
| Constants | UPPER_SNAKE_CASE | `PROFILE_KEY` |
| Functions/variables | camelCase | `loadProfile()` |

### File Organization

- One React component per file. The file name matches the component name.
- Co-locate tests next to source: `profileStore.ts` / `profileStore.test.ts`.
- No barrel `index.ts` files unless the directory has a clear public API. Don't create them preemptively.
- Types that are used by multiple modules go in `src/types/`. Types used by a single module stay in that module.

---

## Patterns to Follow

### localStorage Access

Always use the typed wrapper in `src/engine/storage.ts`:

```ts
// Good
const profile = loadProfile(); // returns LearnerProfile | null

// Bad
const profile = JSON.parse(localStorage.getItem('codequest:profile')!);
```

Never trust raw localStorage data. Always validate with a type guard at the parse boundary.

### React Context

Follow the pattern from `ProfileContext.tsx`:

```ts
// 1. Define the context value type
interface FooContextValue { /* ... */ }

// 2. Create context with undefined default
const FooContext = createContext<FooContextValue | undefined>(undefined);

// 3. Create a hook that enforces provider presence
function useFoo(): FooContextValue {
  const ctx = useContext(FooContext);
  if (ctx === undefined) {
    throw new Error('useFoo must be used within <FooProvider>');
  }
  return ctx;
}

// 4. Memoize the context value to prevent unnecessary re-renders
```

### Error Handling

- **At system boundaries** (localStorage, JSON parsing, content pack loading): validate and handle gracefully. Show a user-friendly error state, not a blank screen.
- **Inside platform code**: trust your types. Don't add defensive null checks for values that the type system guarantees are present.
- **Player code errors**: return structured error objects with user-friendly messages. Never expose stack traces or internal error details to the player.

### Component Structure

```tsx
// Imports (external, then internal, then types)
import { useState } from 'react';
import { useProfile } from '@/engine/ProfileContext';
import type { LearnerProfile } from '@/types/profile';

// Component
export function MyComponent({ prop }: MyComponentProps): React.ReactElement {
  // hooks first
  // derived state
  // handlers
  // render
}

// Props type (co-located, not in a separate file)
interface MyComponentProps {
  prop: string;
}
```

---

## Content Pack System

### Schema

See `docs/CONTENT_SCHEMA.md` for the full JSON schema. Key files in a content pack:

- `course.json` — course metadata, world map, lesson index
- `lessons/{id}/lesson.json` — full lesson definition (all 3 phases)
- `lessons/{id}/assets/` — sprites, backgrounds for that lesson

### Types

TypeScript types mirroring the content schema live in `src/types/content.ts`. These types are the source of truth for what the platform expects from a content pack.

### Loading

Content packs are statically imported at build time (v1). The content loader validates the JSON against the TypeScript types at startup.

---

## Planning Documents

Detailed planning docs are in `docs/`:

| Document | What It Covers |
|----------|---------------|
| `PRD.md` | Product requirements, features, acceptance criteria |
| `ARCHITECTURE.md` | System design, tech stack rationale, security model |
| `CONTENT_SCHEMA.md` | JSON schema for content packs |
| `EPICS.md` | All 19 epics with scope and dependencies |
| `ROADMAP.md` | Phased delivery plan |
| `stories/E-01-platform-shell.md` | Implementation tickets for Epic 1 |
| `stories/E-02-learner-profile.md` | Implementation tickets for Epic 2 |

---

## Common Tasks

### Adding a new component

1. Create the file in the appropriate `src/components/` subdirectory
2. One component per file, PascalCase filename matching component name
3. Co-locate the Props interface in the same file
4. Use `useProfile()`, `useContent()`, etc. to access shared state

### Adding a new localStorage key

1. Define the type in `src/types/`
2. Add a validation function (type guard)
3. Create read/write functions in `src/engine/` using the `storage.ts` wrapper
4. Use the `codequest:` key prefix

### Modifying the content schema

1. Update `docs/CONTENT_SCHEMA.md` (source of truth for the schema)
2. Update `src/types/content.ts` (TypeScript types must match)
3. Update validation in `src/engine/contentLoader.ts`
4. Update any affected content pack JSON files

---

## What NOT to Do

- **Don't use `any`.** Use `unknown` and narrow.
- **Don't use `eval()` or `Function()`.** Player code goes through the AST interpreter.
- **Don't hardcode lesson content in platform code.** It belongs in the content pack JSON.
- **Don't add `console.log`.** Use `console.warn` or `console.error` if you must log. The linter will catch `console.log`.
- **Don't create barrel `index.ts` files preemptively.** Only when a directory has a settled public API.
- **Don't suppress lint errors with `eslint-disable`.** Fix the code or discuss the rule.
- **Don't add dependencies without justification.** The bundle ships to kids on potentially slow connections. Every kilobyte counts.
- **Don't over-abstract.** Three similar lines > one premature abstraction. Wait until you have three real use cases before extracting a utility.
