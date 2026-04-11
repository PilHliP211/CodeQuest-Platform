---
name: unit-tests
description: How to write Vitest unit tests for pure logic, stores, parsers, type guards, and state machines. Load with `testing-strategy` whenever a story adds a function, store, reducer, or validator.
---

# Unit Tests (Vitest)

Unit tests cover **pure logic and state**: parsers, evaluators, type guards, stores, state machines, the interpreter core. They run in Node via Vitest, start in milliseconds, and are the layer where branch coverage lives.

Always pair this skill with `testing-strategy`. The rule from that doc — **assert on outcomes, not mechanics** — is non-negotiable here.

Tests in this layer freely import the gold-standard Flag Hunter pack as a fixture (lesson ids like `'japan'`, blocks like `moveEast`, etc.). Platform code never does. See `testing-strategy → Gold Standard Test Pack` for the full rule.

## Tooling

Vitest is the test runner. If `vitest` is missing from `package.json`, install it in this story:

```bash
npm install -D vitest @vitest/coverage-v8
```

Add to `package.json` scripts (if absent):

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage"
  }
}
```

Vitest uses Vite's config, so no extra config file is needed for unit-only tests. If the test file imports JSX (React), add `environment: 'jsdom'` to a `vitest.config.ts` — but prefer to keep unit tests JSX-free.

## File Conventions

- Place tests **next to the code**: `src/engine/progressStore.ts` → `src/engine/progressStore.test.ts`.
- One test file per source file.
- Test file imports only the public export of the module under test.

## The AAA+O Template

```ts
import { describe, it, expect } from 'vitest';
import { computeXp } from './xp';

describe('computeXp', () => {
  it('awards phase bonus when a phase is completed', () => {
    // Arrange
    const xpConfig = { phaseComplete: 10, lessonComplete: 30, hintUsed: -2, syntaxEditorUsed: 0 };

    // Act
    const result = computeXp({ phasesCompleted: 1, hintsUsed: 0, syntaxUsed: false }, xpConfig);

    // Assert (outcome: the number the UI will display)
    expect(result).toBe(10);
  });
});
```

Each `it` block tests **one outcome** in **one sentence**. The `it` description reads as an English assertion about observable behavior.

## Naming

- `describe(symbolName, ...)` — the function, store, or module under test.
- `it('<does observable thing> when <condition>', ...)` — not "should" prose, not "calls X", not "returns correctly". Describe the behavior.

Good:
- `it('rejects names longer than 20 characters')`
- `it('marks a node as available when its prerequisite is complete')`

Bad:
- `it('should work')`
- `it('calls validateAST')`
- `it('sets state correctly')`

## Coverage By Story Type

### Pure functions (validators, evaluators, parsers)

Every branch + every boundary value:

```ts
describe('isValidName', () => {
  it('accepts a typical name', () => {
    expect(isValidName('Hana')).toBe(true);
  });
  it('rejects an empty string', () => {
    expect(isValidName('')).toBe(false);
  });
  it('rejects names longer than 20 characters', () => {
    expect(isValidName('x'.repeat(21))).toBe(false);
  });
  it('accepts names of exactly 20 characters', () => {
    expect(isValidName('x'.repeat(20))).toBe(true);
  });
  it('rejects whitespace-only names', () => {
    expect(isValidName('   ')).toBe(false);
  });
});
```

### Type guards

Test one positive case per shape and one negative case per rejected field:

```ts
describe('isCourse', () => {
  it('accepts a valid course pack', () => {
    expect(isCourse(validFixture)).toBe(true);
  });
  it('rejects a course missing "lessons"', () => {
    const bad = { ...validFixture, lessons: undefined };
    expect(isCourse(bad)).toBe(false);
  });
  it('rejects a course where "version" is not a string', () => {
    expect(isCourse({ ...validFixture, version: 1 })).toBe(false);
  });
});
```

### Stores (profileStore, progressStore)

Test **observable state transitions**, not internal storage reads:

```ts
describe('progressStore', () => {
  it('reports a lesson as complete after all three phases are marked', () => {
    const store = createProgressStore(new InMemoryStorage());
    store.markPhaseComplete('japan', 1);
    store.markPhaseComplete('japan', 2);
    store.markPhaseComplete('japan', 3);
    expect(store.isLessonComplete('japan')).toBe(true);
  });

  it('preserves xp after the store is rehydrated from storage', () => {
    const storage = new InMemoryStorage();
    const store = createProgressStore(storage);
    store.addXp(25);
    const rehydrated = createProgressStore(storage);
    expect(rehydrated.totalXp).toBe(25);
  });
});
```

Note: the test passes a fake `InMemoryStorage` through the public constructor. It does **not** mock `localStorage` globally, and does not assert what keys were written.

### State machines (lessonRunner)

Test every transition and that invalid transitions are rejected:

```ts
it('advances from phase 1 to phase 2 on phase1-complete', () => {
  const runner = createLessonRunner(japanLesson);
  runner.handle({ type: 'phase1-complete' });
  expect(runner.state.phase).toBe(2);
});

it('ignores a phase1-complete event when already in phase 2', () => {
  const runner = createLessonRunner(japanLesson, { phase: 2, attempts: 0 });
  runner.handle({ type: 'phase1-complete' });
  expect(runner.state.phase).toBe(2);
});
```

## Mocking

Mock only at **system boundaries**: storage, network, time, randomness. Never mock the code under test or its collaborators.

```ts
import { vi } from 'vitest';

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-04-11T12:00:00Z'));
});
afterEach(() => {
  vi.useRealTimers();
});
```

If a test needs to mock a same-file helper to pass, the helper is probably the thing that should be tested directly (or the seam is in the wrong place).

## Fixtures

- Put shared fixtures in `src/test/fixtures/` (NOT in `__fixtures__`).
- Fixtures must be typed with the real production types — `readonly` arrays, no `any`, no casts.
- Prefer small, hand-rolled fixtures per test over a single "god fixture". Each test should tell its own story.

## Anti-Patterns

Never:
- Assert on spy call counts when an output would do.
- Write "it renders without crashing" as the only test. That tests nothing.
- Share mutable state between tests via `let` in `describe`. Rebuild in each `it`.
- Use `any` or `as any` in a test to bypass a type error — fix the type instead.
- Test timers by `await new Promise(r => setTimeout(r, 100))`. Use `vi.useFakeTimers`.
- Put console noise in tests without stubbing it. Fail on unexpected `console.error`.

## The Gate

Before marking the story done:

```
npm run test
npx tsc --noEmit
npm run lint
```

All three must pass. The test file is subject to the same lint rules as source — no `any`, no `console.log`, no disabled lints.
