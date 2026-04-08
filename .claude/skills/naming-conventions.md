---
name: naming-conventions
description: File, component, hook, type, and variable naming rules. Load when creating new files or symbols.
---

# Naming Conventions

| Thing | Convention | Example |
|-------|-----------|---------|
| React component file | PascalCase | `NameEntryScreen.tsx` |
| Utility/module file | camelCase | `profileStore.ts` |
| Type definition file | camelCase | `content.ts` |
| Test file | matches source + `.test` | `profileStore.test.ts` |
| React component | PascalCase | `function WorldMap()` |
| Hook | camelCase, `use` prefix | `useProfile()` |
| Type / Interface | PascalCase | `LearnerProfile` |
| Constant | UPPER_SNAKE_CASE | `PROFILE_KEY` |
| Function / variable | camelCase | `loadProfile()` |
| Generic type param | PascalCase, single letter or descriptive | `T`, `TValue` |

## Rules

- One React component per file. Filename matches the component name exactly.
- Co-locate test files next to source: `foo.ts` + `foo.test.ts`.
- No barrel `index.ts` files unless a directory has a settled public API. Don't create them preemptively.
- Types used by multiple modules go in `src/types/`. Single-module types stay in that module.
- Boolean variables read like predicates: `isLoading`, `hasFlag`, `canEdit`.
- Event handlers use `handle` prefix: `handleSubmit`, `handleClick`.
- Props passed as event handlers use `on` prefix: `onSubmit`, `onClick`.

## File Path Examples

```
src/components/Profile/NameEntryScreen.tsx     ✓
src/components/profile/nameEntryScreen.tsx     ✗ wrong case
src/engine/profileStore.ts                     ✓
src/engine/ProfileStore.ts                     ✗ wrong case for util
src/engine/profileStore.test.ts                ✓
src/types/content.ts                           ✓
```
