# E-10: Canvas Renderer

**Priority:** P0
**Dependencies:** E-09 complete
**Goal:** Player code drives animated visual output on an HTML5 canvas, rendering the flag being restored one drawing call at a time.

The canvas is the payoff moment of every lesson — the point where a kid's code becomes something visible on screen. The renderer must feel responsive, safe, and satisfying. Sequential animation turns a dry list of function calls into a theatrical reveal. The success evaluator closes the loop: it's what converts "code ran" into "lesson complete."

## Stories

| # | Story | Size |
|---|-------|------|
| S-10.01 | `CanvasRenderer.tsx` — canvas element with device pixel ratio | XS |
| S-10.02 | `rendererAPI.ts` — all drawing functions with call logging | M |
| S-10.03 | Whitelist enforcement — expose only `availableFunctions` to interpreter | XS |
| S-10.04 | Sequential animation — step-by-step drawing with 150ms delay | S |
| S-10.05 | `successEvaluator.ts` — semantic comparison against solution | S |
| S-10.06 | "Reset ↺" button — clears canvas and call log | XS |

## Dependency Order

```
S-10.01 (CanvasRenderer component)
  └── S-10.02 (rendererAPI — drawing functions + callLog)
        ├── S-10.03 (whitelist enforcement — filter by availableFunctions)
        │     └── S-10.04 (sequential animation — step-by-step execution)
        │           └── S-10.06 (Reset button — clears canvas + cancels animation)
        └── S-10.05 (successEvaluator — compare callLog to solution)
```

## Epic Validation

**Human Testable Increment:** Run `npm run dev` and open the canvas restore surface from Phase 3 or a temporary `/__dev/canvas` harness. The developer must be able to run the Japan solution, watch the white background and red circle draw sequentially, see success/failure feedback, and click Reset to clear the canvas and call log.

**Automated Validation:** Add unit tests for `rendererAPI`, API whitelisting, sequential animation cancellation, and `successEvaluator` tolerance/call-order outcomes. Add a component test for `CanvasRenderer` that verifies the learner-visible canvas/reset contract without pixel assertions.

**Temporary Surface Decision:** A canvas harness is acceptable until E-11 mounts Phase 3 and E-14 supplies the full content pack. If E-10 adds `/__dev/canvas`, all harness code must live in `src/devHarnesses/` and any harness-only JSON must live in `content/flag-hunter/dev-harnesses/`. Do not add canvas harness files under `src/renderer/` or production lesson modules. Remove the canvas harness when the Japan lesson playthrough exercises the same path.

**Dev Harness Cleanup Contract:** E-10 may add a harness only if the files are easy to delete later:
- Route: `/__dev/canvas` in `App.tsx`
- Screen/loader files: `src/devHarnesses/*Canvas*`
- Harness fixture JSON: `content/flag-hunter/dev-harnesses/*canvas*`
- App route tests: `src/App.test.tsx`

E-11 must delete any E-06 through E-10 harness files whose behavior is covered by `LessonScreen`; E-14 must delete any remaining harnesses once the full Japan playthrough covers them.

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Imperative canvas ref with typed handle | S-10.01 | E-11 lesson runner integration |
| Call log array for semantic evaluation | S-10.02 | S-10.05 success evaluator |
| Whitelist enforcement at API layer | S-10.03 | E-09 sandbox (mirrors the interpreter-layer enforcement) |
| Step-by-step async execution with delay | S-10.04 | Any future animated feedback |
