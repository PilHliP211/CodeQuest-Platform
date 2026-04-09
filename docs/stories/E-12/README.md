# E-12: Progression & Persistence

**Priority:** P0
**Dependencies:** E-02 complete (storage wrapper + profileStore pattern), E-03 complete (content pack IDs)
**Goal:** All learner progress — completed phases, unlocked syntax editors, collected flags, XP — is stored in localStorage and restored on next visit.

Progress persistence is what turns a demo into a game. Without it, every page refresh resets the player to zero. This epic builds the typed localStorage layer for progress data, derives world map node states from it, and adds a reset option in settings. It reuses the `storage.ts` pattern established in E-02.

## Stories

| # | Story | Size |
|---|-------|------|
| S-12.01 | Progress type definitions | XS |
| S-12.02 | `progressStore.ts` — typed read/write wrapper | S |
| S-12.03 | Per-lesson progress save/restore | S |
| S-12.04 | World map node states derived from progress | S |
| S-12.05 | XP total display in HUD | XS |
| S-12.06 | Reset progress in settings (with confirmation) | S |

## Dependency Order

```
S-12.01 (types)
  └── S-12.02 (progressStore)
        ├── S-12.03 (lesson save/restore — wires into E-11 lessonRunner)
        ├── S-12.04 (map node states — wires into E-04 MapCanvas)
        ├── S-12.05 (XP in HUD — wires into E-02 HUD)
        └── S-12.06 (reset — wires into E-02 settings screen)
```

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Typed progress store with key schema | S-12.02 | E-13 flag collection store |
| Derive display state from raw progress data | S-12.04 | E-16 authoring preview, future map expansions |
| Destructive operation with confirmation dialog | S-12.06 | Any future "danger zone" settings |
