# E-09: Code Interpreter & Sandbox

**Priority:** P0
**Dependencies:** E-01 complete
**Goal:** Player-written simplified-JS code is safely executed in a sandboxed environment that calls into the Canvas Renderer API.

This is the security-critical engine of the platform. Player code must never access `window`, `document`, `localStorage`, or any platform internals. The interpreter uses an AST-walking approach (parse → validate whitelist → execute) rather than `eval()`, which satisfies the platform's hard rule against `eval`. Getting the sandbox right here means every future lesson is safe by default — content authors cannot accidentally expose dangerous APIs.

## Stories

| # | Story | Size |
|---|-------|------|
| S-09.01 | Install `acorn` parser | XS |
| S-09.02 | AST node type definitions | XS |
| S-09.03 | `sandbox.ts` — whitelist enforcement | M |
| S-09.04 | `interpreter.ts` — AST walker core | M |
| S-09.05 | Friendly error messages | S |
| S-09.06 | Interpreter unit tests | M |
| S-09.07 | Step-by-step execution mode | S |

## Dependency Order

```
S-09.01 (install acorn)
  └── S-09.02 (AST types)
        └── S-09.03 (sandbox — whitelist enforcement)
              └── S-09.04 (interpreter — walker + executor)
                    └── S-09.05 (friendly errors — wraps interpreter output)
                          ├── S-09.06 (unit tests — tests all of the above)
                          └── S-09.07 (step mode — extends interpreter)
```

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| AST-walking interpreter with injected scope | S-09.04 | E-10 canvas API injection, E-11 lesson execution |
| Whitelist-based identifier validation | S-09.03 | E-08 Monaco autocomplete restriction |
| `PlayerFriendlyError` with line number | S-09.05 | E-11 error display in lesson screen |
| Step-by-step generator execution | S-09.07 | E-10 sequential drawing animation |
