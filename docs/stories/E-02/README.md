# E-02: Learner Profile

**Priority:** P0
**Dependencies:** E-01 complete
**Goal:** Kids enter a name, see it in the UI, and can change it later. The name persists across sessions.

This is a small feature, but it establishes patterns (typed localStorage wrapper, React context, gate screens, accessible forms) that later epics will reuse. Get the patterns right here.

## Stories

| # | Story | Size |
|---|-------|------|
| S-02.01 | LearnerProfile type | XS |
| S-02.02 | Generic localStorage wrapper (`storage.ts`) | S |
| S-02.03 | Profile type guard | XS |
| S-02.04 | Profile store (`profileStore.ts`) | XS |
| S-02.05 | ProfileContext + provider | S |
| S-02.06 | useProfile hook | XS |
| S-02.07 | NameEntryScreen layout & styling | S |
| S-02.08 | Name input validation | XS |
| S-02.09 | Name entry form accessibility | XS |
| S-02.10 | App gate (block app until profile exists) | XS |
| S-02.11 | HUD bar component | XS |
| S-02.12 | HUDLayout wrapper | XS |
| S-02.13 | Settings screen layout | XS |
| S-02.14 | Settings name-change form | S |
| S-02.15 | Settings navigation (HUD ↔ Settings) | XS |

## Dependency Order

```
S-02.01 (type)
  └── S-02.02 (storage wrapper)
        └── S-02.03 (type guard)
              └── S-02.04 (profile store)
                    └── S-02.05 (context provider)
                          └── S-02.06 (hook)
                                ├── S-02.07 (NameEntry layout)
                                │     └── S-02.08 (validation)
                                │           └── S-02.09 (a11y)
                                │                 └── S-02.10 (app gate)
                                ├── S-02.11 (HUD bar)
                                │     └── S-02.12 (HUD layout)
                                └── S-02.13 (Settings layout)
                                      └── S-02.14 (name change form)
                                            └── S-02.15 (navigation)
```

## Patterns Established Here

These get reused by E-12 (Progression) and beyond. Get them right.

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Typed localStorage wrapper with validation | S-02.02 | E-12 progression keys |
| React context with persistent state | S-02.05 | E-03 content, E-12 progress |
| Hook with provider check | S-02.06 | All future contexts |
| Full-screen gate component | S-02.10 | E-03 content load errors |
| HUD layout wrapper | S-02.12 | E-12 XP, E-04 map nav |
| Accessible form pattern | S-02.07–09 | All future forms |
