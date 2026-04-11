---
name: invariant-tests
description: How to write property-based (fast-check) tests for security-critical code — specifically the interpreter sandbox and content pack validator. Load with `testing-strategy` on any story that touches `src/engine/interpreter/*` or the content pack validator.
---

# Invariant Tests (fast-check)

Some invariants are too important to leave to example-based tests. "The sandbox rejects `window.alert`" is one example. The true invariant is "**the sandbox rejects every identifier not in the allowlist**", and no finite list of `it('rejects X')` cases can prove it. Property-based tests generate hundreds of randomized inputs per run and look for counterexamples.

Use this skill **only** for:
- The interpreter sandbox (E-09).
- The content pack type guards / validator (E-03).
- The canvas renderer's argument validation (E-10).

Do not use property-based tests for UI, stores, or anything a learner directly interacts with — example-based component/unit tests are faster to read and debug.

Note that the content-pack validator (E-03 / `isCourse`) is the **one** test in the project that must work for **every** valid pack — present and future. The gold-standard Flag Hunter pack is not enough for that boundary; the property test fills the gap. See `testing-strategy → Gold Standard Test Pack` for why one canonical fixture is sufficient for everything else.

## Tooling

First story that needs this installs:

```bash
npm install -D fast-check
```

`fast-check` is zero-config and integrates with Vitest directly.

## The Rule

Write the **invariant**, not examples. An invariant is a statement of the form:

> For all inputs `x` in some domain, some outcome is true.

If you cannot write the statement in that form, you do not need a property test — use example-based unit tests.

## The Template

```ts
import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { execute } from './interpreter';

describe('interpreter sandbox — invariants', () => {
  // Invariant: no identifier outside the allowed scope can ever produce a truthy call.
  it('rejects every unknown global identifier', () => {
    fc.assert(
      fc.property(
        // Arbitrary: any JavaScript-like identifier not in the allowlist
        fc.string({ minLength: 1, maxLength: 12 }).filter(
          (s) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(s) && !ALLOWED.has(s),
        ),
        (ident) => {
          // Outcome: calling it always fails
          const result = execute(`${ident}()`, ALLOWED_SCOPE);
          expect(result.success).toBe(false);
        },
      ),
      { numRuns: 200 },
    );
  });

  // Invariant: banned statement keywords are always rejected
  it('rejects any program containing a banned keyword', () => {
    const banned = fc.constantFrom('var', 'import', 'export', 'eval', 'with', 'delete');
    fc.assert(
      fc.property(banned, (keyword) => {
        const result = execute(`${keyword} x = 1`, ALLOWED_SCOPE);
        expect(result.success).toBe(false);
      }),
    );
  });
});
```

Notes:
- The arbitrary generator models the **input domain** — every string that could plausibly appear as an identifier.
- The assertion is a **single outcome** — `success` is false. No mechanic assertions.
- `numRuns` defaults to 100; bump to 200–500 for security-critical invariants. Never lower it.

## Content Pack Validator

```ts
// Invariant: a content pack that passes the validator always has a non-empty course title
// AND a lesson list AND a defined map.
it('every pack accepted by isCourse exposes the invariants the rest of the app depends on', () => {
  fc.assert(
    fc.property(arbitraryCandidateCourse(), (candidate) => {
      if (isCourse(candidate)) {
        expect(candidate.title.length).toBeGreaterThan(0);
        expect(candidate.lessons.length).toBeGreaterThan(0);
        expect(candidate.map).toBeDefined();
      }
      // If isCourse returns false, there is no assertion — the test just checks
      // that accepted packs uphold the downstream contract.
    }),
  );
});
```

Where `arbitraryCandidateCourse()` is a custom generator that builds mostly-valid but sometimes-broken objects. The point: **for every pack the validator says is valid, the invariants the rest of the platform relies on must hold.**

## Shrinking

When fast-check finds a counterexample, it automatically shrinks it to the smallest failing input. **Read the shrunk case, not the original.** That is the minimal bug to reproduce.

If a test finds a counterexample:

1. Copy the shrunk input into a permanent example-based test (`it('rejects <specific case>')`). This prevents regression even if the property test is later disabled.
2. Fix the code.
3. Re-run the property test to confirm.

## When A Property Test Is Wrong

- It generates nothing useful — the filter rejects 99% of inputs. Rewrite the arbitrary to produce valid-but-varied inputs natively.
- It asserts on a mechanic (call count, internal state). Rewrite the assertion to target the outcome.
- It passes trivially because the filter is too strict. Add a sanity check: `fc.statistics` to see the distribution, or add an `it('generator produces at least N distinct inputs')` sanity test.

## Integration With Unit Tests

Property tests **augment** example tests; they do not replace them. A story that needs invariant tests ships:

- Example-based unit tests for the specific cases called out in the story (readable documentation of intent).
- Property-based tests for the invariants that span all inputs (automated counterexample search).

Both live in the same `.test.ts` file unless the property suite gets large enough to warrant its own file (`interpreter.invariants.test.ts`).

## The Gate

```
npm run test
npx tsc --noEmit
npm run lint
```

Property tests run inside `npm run test` like any other Vitest file — no separate command.

## Anti-Patterns

- `fc.assert(...)` inside a `beforeEach`. Properties belong inside `it`.
- A property with `numRuns: 10`. If you need speed, shrink the input domain; don't shrink the runs.
- A property that only ever tests one hand-crafted input wrapped in `fc.constant`. That's just a unit test wearing a hat.
- Using `fc.anything()` as input. Constrain the domain to what the function must handle.
- Silently catching the `fc.assert` failure to make the suite green.
