---
name: anti-patterns
description: Things never to do in this codebase. Quick reference for common mistakes. Load anytime you're about to write a lot of code.
---

# Anti-Patterns

## Don't

| Don't | Do |
|-------|-----|
| Use `any` | Use `unknown` and narrow with type guards |
| Use `eval()` or `new Function()` | Player code goes through the AST interpreter |
| Hardcode lesson content in `src/` | Put it in the content pack JSON |
| Use `console.log` | Use `console.warn` / `console.error` (or remove the log) |
| Add `eslint-disable` comments | Fix the code |
| Create barrel `index.ts` files preemptively | Wait until the directory has a settled public API |
| Add a dependency without justification | See `dependency-policy` skill |
| Over-abstract on first use | Three real use cases before extracting |
| Default-export React components | Named exports only |
| Use `React.FC` | Plain function with explicit return type |
| Define a sub-component inside another component | Hoist to module scope |
| Call `localStorage.*` directly | Use `src/engine/storage.ts` wrapper |
| Use `==` or `!=` (except `!= null`) | Use `===` / `!==` |
| Skip a switch case | `switch-exhaustiveness-check` will catch you anyway |
| Silently swallow errors with `try { } catch { }` | Handle it or let it throw |
| Add `// TODO` without an issue link | Either fix it or file a ticket |

## Don't Add Things That Weren't Asked For

- Don't add error handling for impossible scenarios
- Don't add config options for one use case
- Don't add docstrings to code you didn't write
- Don't add type annotations to inferred locals
- Don't refactor surrounding code while fixing a bug
- Don't add backwards-compatibility shims; just change the code

## Don't Trust External Data

Anything coming from outside platform code is `unknown` until validated:
- `JSON.parse` results
- `localStorage.getItem` results
- Imported content pack JSON
- Future: API responses

Validate at the boundary with a type guard. Past the boundary, trust your types.
