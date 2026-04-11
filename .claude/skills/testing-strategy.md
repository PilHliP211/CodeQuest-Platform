---
name: testing-strategy
description: The outcome-focused validation philosophy for CodeQuest. Load this BEFORE any story that produces executable code, changes behavior, or adds a user-visible feature. The master doc that the other `*-tests` skills implement.
---

# Testing Strategy

CodeQuest validates behavior, not implementation. A test earns its place only if it catches a real regression a user (learner) would feel. Tests that restate the code's structure are a tax; tests that lock in outcomes are an investment.

## The One Rule

**Assert on outcomes a user or caller can observe — never on internal mechanics.**

| Outcome (test this)                         | Mechanic (don't test this)              |
| -------------------------------------------- | ---------------------------------------- |
| "Player sees the Japan node highlighted"     | "`isAvailable` returned `true`"          |
| "Running `moveEast()` advances the player"   | "`dispatch` was called with `MOVE_EAST`" |
| "XP in the HUD updates after phase complete" | "`setXp` state setter was invoked"       |
| "Sandbox rejects `window.alert`"             | "`validateAST` threw at node index 3"    |
| "Progress survives reload"                   | "`localStorage.setItem` was called"      |

If the implementation changes but the observed outcome stays the same, the test must keep passing. If your test has to change every time the code is refactored, you are testing mechanics.

## The Test Pyramid (for this project)

```
           ┌─────────────┐
           │  E-2-E (1)  │   Playwright — full lesson playthrough
           └─────────────┘
         ┌─────────────────┐
         │  Component (2)  │   Testing Library — user-visible behavior
         └─────────────────┘
       ┌─────────────────────┐
       │   Unit  (many)      │   Vitest — pure logic, state, parsers, evaluators
       └─────────────────────┘
     ┌─────────────────────────┐
     │  Invariant (sandbox)    │   fast-check — interpreter security boundary
     └─────────────────────────┘
```

Each layer has a skill:

| Skill               | Use when                                                        |
| ------------------- | --------------------------------------------------------------- |
| `unit-tests`        | Pure functions, stores, type guards, state machines, evaluators |
| `component-tests`   | Any React component with user-visible behavior                  |
| `e2e-tests`         | Critical end-to-end flows (lesson playthrough, deployment smoke) |
| `invariant-tests`   | Security-critical code — the interpreter sandbox                |

## What Deserves a Test

Before writing a test, ask: **"What learner-visible behavior would break if this code regressed?"** If you cannot answer in one sentence, don't write the test.

Write a test for:
- **Pure logic** with branches, edge cases, or off-by-one risk (`successEvaluator`, `validateCourse`, `isValidName`).
- **State transitions** (profileStore, progressStore, lessonRunner phase machine).
- **Component contracts** — what the component renders given props, how it reacts to user events.
- **Security boundaries** — the interpreter sandbox, content pack validation.
- **Critical journeys** — the full Japan lesson in Playwright.

Do **not** write a test for:
- Type-only files (`src/types/content.ts`). `tsc --noEmit` is the test.
- Thin wrappers that just re-export (`useProfile`, `useContent`). Exercised by component tests.
- Trivial getters/setters without branches.
- React Context plumbing — test it through a consumer.
- Implementation details: internal helper functions, private state, render counts, hook call order.
- CSS, font files, static assets, config files.

## The Validation Loop

Every code-producing story ends with this loop. Agents run it until it passes; humans review only if it will not converge.

```
1. npm run lint
2. npx tsc --noEmit
3. npm run test         # Vitest (unit + component + invariant)
4. npm run test:e2e     # Playwright (only for stories that touch critical flows)
5. npm run format:check
6. npm run build
```

The story's `Done When` checklist must pass all of the gates above that apply to it. A story that adds a feature without a test it could have had is not done.

## Outcome Assertions — The AAA+O Pattern

Every test follows **Arrange → Act → Assert-Outcome**:

```ts
it('unlocks the next node when the current lesson completes', () => {
  // Arrange: a progress store with one lesson completed
  const store = makeProgressStore({ 'japan': { phase3Complete: true } });

  // Act: ask for the map state
  const mapState = deriveMapState(store, course);

  // Assert OUTCOME: the caller observes the next node as available
  expect(mapState.getNodeState('korea')).toBe('available');
});
```

Note what the assertion does **not** check: it does not verify which internal function computed the state, which branch was taken, or which keys were read from storage. Those could all change tomorrow — the outcome is the only thing the rest of the app depends on.

## What the Agent Must Do, by Story Type

| Story touches…                    | Minimum tests                                                                    |
| --------------------------------- | -------------------------------------------------------------------------------- |
| Pure function / parser / store    | Vitest unit tests — happy path + every branch + edge cases                       |
| React component                   | Component test — renders, accessible name, primary user interaction              |
| State machine (lessonRunner)      | Unit tests — every transition + invalid inputs are rejected                      |
| Interpreter / sandbox             | Unit tests **and** invariant tests (fast-check)                                  |
| Content pack validator            | Unit tests — valid pack passes, each schema violation is caught                  |
| A full lesson flow                | Playwright E2E — one happy path run from name entry to flag collected            |
| Types only / config only          | No tests. `tsc --noEmit` covers it.                                              |

## Test Infrastructure Installed As Needed

The first story in an epic that needs a new test tool installs it, once, and updates `package.json`. See:

- `unit-tests` — installs Vitest + Testing Library if not yet present.
- `e2e-tests` — installs Playwright if not yet present.
- `invariant-tests` — installs fast-check if not yet present.

New test tools count as new dependencies, so the `dependency-policy` skill applies.

## Hard Rules

- No snapshot tests. They test mechanics, not outcomes, and rot silently.
- No `expect(fn).toHaveBeenCalled()` as a primary assertion — a call is a mechanic. Use it only when the function is the boundary (e.g., "interpreter called `drawCircle(10, 20, 5, 'red')`").
- No sleeping. Use Testing Library's `findBy*` / Playwright's auto-waiting.
- No testing private or non-exported helpers. If it matters, it's observable through a public API.
- No `console.log` in tests. ESLint will block the commit.
- No `any` in tests. The same type rules apply.
- No disabled tests (`.skip`, `.only`) in committed code.
- A failing test is a red flag, never a reason to delete or weaken the assertion.

## When A Test Fails

1. Read the failure. Do not re-run blindly.
2. Decide: is the **outcome** wrong, or is the **test** testing mechanics?
   - If the outcome is wrong → fix the code.
   - If the test is mechanics → rewrite the assertion to target the outcome, then fix the code if needed.
3. Never weaken an assertion to go green. Never add a try/catch inside a test to paper over a failure.
