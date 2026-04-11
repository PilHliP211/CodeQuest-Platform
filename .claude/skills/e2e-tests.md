---
name: e2e-tests
description: How to write Playwright end-to-end tests that drive a real browser through a full learner flow. Load with `testing-strategy` when a story covers a critical user journey, a deployment smoke test, or an E-14 / E-15 verification.
---

# End-to-End Tests (Playwright)

E2E tests prove the learner can complete a real journey — name entry through a full lesson to the lesson's reward — in a real browser against the built app. They are the only layer that exercises Blockly, Monaco, Canvas, interpreter, state machine, content pack, and localStorage together.

They are also the most expensive layer to write and maintain. **Keep them few, keep them critical.**

Pair with `testing-strategy`. The outcome-first rule is even stricter in E2E — you assert on what a learner sees, never on what the browser devtools reveal. The E2E suite runs against the **gold-standard Flag Hunter content pack** as the canonical fixture; see `testing-strategy → Gold Standard Test Pack` for why one pack is enough.

## When to Write an E2E Test

Only three categories:

1. **The golden path of the gold-standard pack's first lesson** — full playthrough from first launch through to the lesson's reward. The current implementation is the Japan lesson of the Flag Hunter pack (E-14). When Flag Hunter grows new lessons, the golden-path test stays on lesson #1; new lessons are exercised at lower layers.
2. **A deployment smoke test** — after deploy, the site loads at the correct base path. This is E-15.
3. **A cross-subsystem contract** you cannot verify in a component test — e.g., "Phase 2 unlock in state machine persists into Phase 3 via localStorage after a full page reload".

That is the entire allowed set. Do not add an E2E test for things that a component or unit test can cover.

## Tooling

First E2E story installs:

```bash
npm install -D @playwright/test
npx playwright install --with-deps chromium
```

`playwright.config.ts` at repo root:

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? 'github' : 'list',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
```

Add to `package.json`:

```json
{
  "scripts": {
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

Tests live in `e2e/` at the repo root (NOT in `src/`), so they are not picked up by Vitest.

## The One Rule

Query Playwright locators by **user-facing identity**: role + accessible name, or visible text. Never by class, id, or test-id unless there is no accessible handle.

```ts
await page.getByRole('button', { name: /run/i }).click();
await expect(page.getByText(/you found the flag/i)).toBeVisible();
```

## The Golden Path Template (E-14)

```ts
// e2e/japan-lesson.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Japan lesson — full playthrough', () => {
  test.beforeEach(async ({ page }) => {
    // Outcome precondition: a fresh learner with no progress
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('a new learner can complete the Japan lesson end-to-end', async ({ page }) => {
    // ── Name entry ────────────────────────────────────────────
    await page.getByLabel(/your name/i).fill('Hana');
    await page.getByRole('button', { name: /start/i }).click();

    // Outcome: learner is on the map and sees their name
    await expect(page.getByText('Hana')).toBeVisible();
    await expect(page.getByRole('button', { name: /japan/i })).toBeEnabled();

    // ── Phase 1: Navigate ─────────────────────────────────────
    await page.getByRole('button', { name: /japan/i }).click();
    await advanceDialogue(page);
    await runBlocks(page, ['moveEast', 'moveEast', 'moveNorth']);

    // Outcome: Phase 2 intro is visible
    await expect(page.getByText(/phase 2/i)).toBeVisible();

    // ── Phase 2: Investigate ──────────────────────────────────
    await advanceDialogue(page);
    await runBlocks(page, ['searchArea', 'collectItem']);

    // ── Phase 3: Restore (syntax editor) ──────────────────────
    await advanceDialogue(page);
    await page.getByRole('textbox', { name: /code editor/i })
      .fill('fillBackground("white")\ndrawCircle(150, 100, 60, "red")');
    await page.getByRole('button', { name: /run/i }).click();

    // ── Final outcomes ────────────────────────────────────────
    await expect(page.getByText(/flag collected/i)).toBeVisible();
    await expect(page.getByRole('img', { name: /japan flag/i })).toBeVisible();

    // Persistence outcome: progress survives reload
    await page.reload();
    await expect(page.getByRole('button', { name: /japan/i }))
      .toHaveAccessibleName(/completed/i);
  });
});

async function advanceDialogue(page) {
  // Click-through all dialogue. Dialogue box advances on click of its continue button.
  while (await page.getByRole('button', { name: /continue/i }).isVisible()) {
    await page.getByRole('button', { name: /continue/i }).click();
  }
}

async function runBlocks(page, blockIds: readonly string[]) {
  // Helper provided by the Blockly harness — see e2e/helpers/blockly.ts
  for (const id of blockIds) {
    await page.getByRole('button', { name: new RegExp(id, 'i') }).click();
  }
  await page.getByRole('button', { name: /run/i }).click();
}
```

This test makes **four** assertions that a real learner would notice: the map shows their name, Phase 2 starts, the flag is collected, progress persists. The test does not assert on which XP number appeared, which dispatch fired, or which key went into localStorage — those are covered at lower layers.

## Helpers and Fixtures

- Put helpers in `e2e/helpers/`.
- Put test fixtures (fake content packs for error-gate testing) in `e2e/fixtures/`.
- A helper is allowed to reach into Playwright's `page.evaluate` for deterministic setup (e.g., priming `localStorage` with a completed state). It is **never** allowed to assert on implementation details.

## What A Good E2E Test Looks Like

Signs a test is earning its place:

- Every assertion is something a learner or parent could describe without knowing the codebase.
- The test would catch a break in **any** of the subsystems it traverses, not just one.
- It runs in under 60 seconds locally.
- It is deterministic — no `waitForTimeout`, no polling loops, no retries-for-flakiness.

Signs a test should be deleted or moved down the pyramid:

- It asserts on a single component's behavior — move to a component test.
- It asserts on pure function output — move to a unit test.
- It uses `page.waitForTimeout(ms)`.
- It queries with `locator('.css-class-name')` or `locator('#id-from-dom')`.
- It fails more often than it catches real bugs.

## Running in CI

Add to `.github/workflows/ci.yml` under its own job (E2E is slower than unit tests and can run in parallel with the lint/build job):

```yaml
e2e:
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with: { node-version: '20' }
    - run: npm ci
    - run: npx playwright install --with-deps chromium
    - run: npm run build
    - run: npm run test:e2e
    - uses: actions/upload-artifact@v4
      if: failure()
      with:
        name: playwright-report
        path: playwright-report/
```

Only stories that modify an E2E test or its subsystems need to run `npm run test:e2e` locally before committing. CI runs it on every PR regardless.

## Anti-Patterns

- Adding a new `.spec.ts` for every feature. If a unit or component test can cover it, that's where it belongs.
- `page.waitForTimeout(500)` — always replaceable with a proper locator + auto-wait.
- `page.locator('.button-primary')` — forbidden. Use `getByRole('button', { name })`.
- Asserting on URL query strings or route internals instead of what's rendered.
- Wrapping assertions in try/catch "to be safe".
- Committing with screenshots hard-coded to the author's machine.

## The Gate

Before marking a story done that touches an E2E test:

```
npm run build
npm run test:e2e
npm run lint
```

Any E2E failure is a blocker — never mark `.skip` to ship.
