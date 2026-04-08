---
name: typescript-standards
description: TypeScript strict mode rules, type patterns, and the no-any policy. Load when writing or modifying any .ts/.tsx file.
---

# TypeScript Standards

## Strict Mode

`tsconfig.json` enables every strict flag. These are non-negotiable:

- `strict: true`
- `noUncheckedIndexedAccess: true` — `array[i]` returns `T | undefined`
- `exactOptionalPropertyTypes: true` — `{ name?: string }` does NOT accept `{ name: undefined }`
- `noImplicitReturns: true`
- `noFallthroughCasesInSwitch: true`
- `noUnusedLocals: true`
- `noUnusedParameters: true`

## The No-Any Rule

**Never use `any`.** At system boundaries (JSON.parse, localStorage, fetch responses, content pack imports), use `unknown` and narrow with type guards.

```ts
// Bad
function load(): any { return JSON.parse(raw); }

// Good
function load(): LearnerProfile | null {
  const data: unknown = JSON.parse(raw);
  return isLearnerProfile(data) ? data : null;
}

function isLearnerProfile(data: unknown): data is LearnerProfile {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof (data as { name: unknown }).name === 'string'
  );
}
```

## Explicit Return Types

Exported functions must have explicit return types. Internal helpers and arrow callbacks can rely on inference.

```ts
// Required: exported
export function loadProfile(): LearnerProfile | null { /* ... */ }

// OK: arrow callback
const names = profiles.map((p) => p.name);
```

## Discriminated Unions for State

Prefer discriminated unions over optional fields. They make impossible states impossible.

```ts
// Bad
interface State {
  isLoading: boolean;
  data?: Profile;
  error?: string;
}

// Good
type State =
  | { status: 'loading' }
  | { status: 'ready'; data: Profile }
  | { status: 'error'; message: string };
```

This pairs with `switch-exhaustiveness-check` — when you add a new variant, every switch on `state.status` becomes a compile error until handled.

## Type vs Interface

- `interface` for object shapes that may be extended
- `type` for unions, intersections, mapped types, primitives

## Avoid Type Assertions

`as` is an escape hatch from the type system. Use it only at boundaries with a comment explaining why. Never `as any`. Prefer type guards.
