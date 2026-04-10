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

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| `useReducer`-based state machine with typed actions | S-11.02 | E-12 progress state, any future complex state |
| Phase-gated UI rendering | S-11.02 | Every lesson screen component |
| Narrative trigger system | S-11.04 | E-14 content pack narrative scripts |
| Context + hook for complex engine state | S-11.06 | Future lesson types, replay mode |
