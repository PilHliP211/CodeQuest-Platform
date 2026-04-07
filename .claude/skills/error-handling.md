---
name: error-handling
description: Where to validate, where to trust types, and how to surface errors to players vs developers. Load when handling errors or designing error states.
---

# Error Handling

## The Three Boundaries

| Boundary | Strategy |
|----------|----------|
| **System boundaries** (localStorage, JSON.parse, fetch, content pack imports) | Validate. Return `null` or a typed error result. Show user-friendly UI state. |
| **Internal platform code** | Trust the type system. No defensive null checks for values TypeScript guarantees. |
| **Player-written code** (in the interpreter) | Catch all errors. Return structured error objects with kid-friendly messages. Never expose stack traces. |

## System Boundary Example

```ts
// localStorage read — validate, return null on failure
export function loadProfile(): LearnerProfile | null {
  return readStorage(PROFILE_KEY, isLearnerProfile);
}

// Caller handles null
const profile = loadProfile();
if (profile === null) {
  return <NameEntryScreen />;
}
```

## Internal Trust Example

```ts
// Bad: defensive check that types already guarantee
function greet(profile: LearnerProfile): string {
  if (!profile || !profile.name) return 'Hello'; // unnecessary
  return `Hello ${profile.name}`;
}

// Good: trust the type
function greet(profile: LearnerProfile): string {
  return `Hello ${profile.name}`;
}
```

## Player Code Example

```ts
// Interpreter catches everything and translates
try {
  const ast = parseSimplifiedJS(playerCode);
  validateAst(ast);
  executeAst(ast, sandbox);
} catch (e) {
  return {
    kind: 'error',
    line: extractLine(e),
    message: friendlyMessage(e), // "It looks like you forgot a closing parenthesis on line 3!"
  };
}
```

## Error UI States

Every state machine that can fail must have a defined error UI. The platform never shows a blank screen.

- **Content pack failed to load:** dedicated error screen with the message and a "Try Again" button.
- **localStorage corrupted:** silent fallback to "first launch" state. Don't scare the user.
- **Player code error:** show the friendly message inline, near the editor, with the line highlighted.

## Rules

- No `try/catch` to silently swallow errors. If you catch, you must do something meaningful.
- No `.catch(() => {})` on promises. Use `.catch(handleError)` or let it throw.
- No exposing internal error messages or stack traces to players.
- Domain-level errors are typed result objects, not thrown exceptions: `{ ok: true, value } | { ok: false, error }`.
