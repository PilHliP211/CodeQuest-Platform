# E-11: Lesson Runner & Phase State Machine

**Priority:** P0
**Dependencies:** E-03, E-04, E-05, E-06, E-08, E-09, E-10 complete
**Goal:** A central state machine that manages the player's progress through the 3 phases of a lesson, coordinating all subsystems.

The lesson runner is the conductor. It owns the question "what is the player doing right now?" and dispatches answers to every subsystem: the narrative system knows when to show a scene, the block editor knows which phase it's in, the canvas renderer knows when to accept code, and the progress store knows when to save. Getting the state machine right here means all subsystems stay in sync without ad-hoc prop drilling.

## Stories

| # | Story | Size |
|---|-------|------|
| S-11.01 | Lesson state types | XS |
| S-11.02 | `lessonRunner.ts` — phase state machine core | M |
| S-11.03 | Attempt counter + hint trigger | S |
| S-11.04 | Phase transition events → Narrative integration | S |
| S-11.05 | XP award on phase/lesson completion | XS |
| S-11.06 | `LessonContext` + provider + hook | S |

## Dependency Order

```
S-11.01 (state types)
  └── S-11.02 (state machine reducer)
        ├── S-11.03 (attempt counter + hints — extends reducer)
        ├── S-11.04 (narrative events — extends reducer + context)
        └── S-11.05 (XP award — extends reducer)
              └── S-11.06 (LessonContext — wraps all of the above)
```

## Epic Validation

**Human Testable Increment:** Run `npm run dev`, enter a learner name, click the Japan node, and land in a real `LessonScreen` instead of a console stub. The developer must be able to advance narrative, submit a success/failure action, see phase labels or challenge surfaces update, see hints after failed attempts, and return to the map when the lesson completes.

**Automated Validation:** Add unit tests for every lesson runner transition, invalid transitions, hint thresholds, narrative selection, and XP calculation. Add component tests for `LessonContext`/`LessonScreen` proving map node selection opens the correct lesson and visible phase state changes after user actions.

**Temporary Surface Decision:** This epic should retire the E-06 through E-10 dev harnesses where the real lesson path can exercise the same behavior. Any remaining harness must be documented as temporary and removed by E-14.

**Dev Harness Removal Checklist:** When `LessonScreen` covers the same behavior, remove the matching temporary surface completely:
- Delete the `/__dev/block-editor`, `/__dev/syntax-editor`, `/__dev/interpreter`, and `/__dev/canvas` routes from `App.tsx` as each becomes redundant.
- Delete the matching route tests and mocks from `src/App.test.tsx`.
- Delete obsolete harness screens/loaders from `src/devHarnesses/`.
- Delete obsolete harness fixture JSON from `content/flag-hunter/dev-harnesses/`.
- Keep only harnesses whose behavior is not yet covered by the real lesson flow, and list the remaining files in the E-11 PR description with the E-14 cleanup trigger.
- Do not add new harness files outside `src/devHarnesses/` or `content/flag-hunter/dev-harnesses/`.

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| `useReducer`-based state machine with typed actions | S-11.02 | E-12 progress state, any future complex state |
| Phase-gated UI rendering | S-11.02 | Every lesson screen component |
| Narrative trigger system | S-11.04 | E-14 content pack narrative scripts |
| Context + hook for complex engine state | S-11.06 | Future lesson types, replay mode |
