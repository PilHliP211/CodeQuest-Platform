---
name: security-rules
description: Player code execution security model — the no-eval rule and sandbox boundaries. Load when working on the interpreter, sandbox, or anything that touches player-written code.
---

# Security Rules

## The No-Eval Rule

Player code is **never** executed via:
- `eval()`
- `new Function()`
- `setTimeout(string, ...)` / `setInterval(string, ...)`
- `vm2` or any third-party "safe eval" library
- Dynamic `import(playerCode)`

Every one of these is forbidden by ESLint and by code review.

## The Execution Pipeline

```
Player code (string)
  → acorn.parse() → AST
  → AST whitelist validator
  → Custom tree-walking interpreter
  → Calls into injected drawing API
  → Canvas output
```

## Whitelist Validation

The AST is walked before execution. Any node type or identifier not on the allowlist causes rejection with a friendly error.

**Allowed AST nodes:** `Program`, `ExpressionStatement`, `CallExpression`, `Identifier`, `Literal`, `VariableDeclaration` (with `let` only), `BinaryExpression`, `ForStatement`, `IfStatement`, `BlockStatement`, `FunctionDeclaration`, `ReturnStatement`.

**Allowed identifiers:** Only the function names listed in the current lesson's `availableFunctions`, plus `let` variables declared in player code itself.

**Blocked:**
- `var`, `const` (player code uses `let` only)
- `MemberExpression` (no `foo.bar` — prevents prototype/global access)
- Any identifier not in the lesson allowlist
- All built-in globals: `window`, `document`, `globalThis`, `localStorage`, `fetch`, `XMLHttpRequest`, `eval`, `Function`, etc.

## The Injected API

The interpreter's execution scope is built from scratch — it does NOT inherit from `globalThis`. Only the lesson's `availableFunctions` are added.

```ts
// Bad: would expose all globals
const scope = { ...globalThis, drawCircle };

// Good: only what's allowed
const scope = Object.create(null);
scope.drawCircle = drawCircle;
scope.fillBackground = fillBackground;
```

## Error Messages

Security failures must be friendly, never technical:

```
Bad:  "ReferenceError: window is not defined"
Good: "It looks like you tried to use 'window'. That isn't available in this lesson."

Bad:  "SyntaxError: Unexpected token at position 47"
Good: "Hmm, something looks off on line 3. Did you forget a closing parenthesis?"
```

## Testing the Boundary

Every new interpreter feature must include security boundary tests:
- Attempt to access `window`, `document`, `localStorage`, `fetch` → all rejected
- Attempt to call `eval`, `Function` → rejected
- Attempt member access `foo.constructor` → rejected
- Attempt to use a function not in the lesson allowlist → friendly error
