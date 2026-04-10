# E-14: First Content Pack — Flag Hunter: Japan

**Priority:** P0
**Dependencies:** E-03 through E-13 complete
**Goal:** A complete, playable lesson for Japan that exercises all three phases and validates the full platform end-to-end.

This epic is the integration test for the entire platform. If everything is wired up correctly, a developer can play through the Japan lesson from start to finish — entering a name, seeing the map, clicking Japan, playing through all three phases, watching the flag appear in the collection, and seeing XP update in the HUD. If any piece is missing or broken, it will show up here.

This epic produces content, not code. Every story is about writing JSON, sourcing assets, and validating the integration.

## Stories

| # | Story | Size |
|---|-------|------|
| S-14.01 | `course.json` scaffold | S |
| S-14.02 | `lesson.json` scaffold (Japan, all 3 phases) | M |
| S-14.03 | Phase 1 narrative scripts | S |
| S-14.04 | Phase 2 narrative scripts | S |
| S-14.05 | Phase 3 narrative scripts + celebration | S |
| S-14.06 | Block definitions (all 8 blocks) | S |
| S-14.07 | Canvas solution definition | XS |
| S-14.08 | Asset sourcing and ATTRIBUTION.md | S |
| S-14.09 | End-to-end playthrough verification | M |

## Dependency Order

```
S-14.01 (course.json)
  └── S-14.02 (lesson.json scaffold)
        ├── S-14.03 (phase 1 narrative)
        ├── S-14.04 (phase 2 narrative)
        ├── S-14.05 (phase 3 narrative + celebration)
        ├── S-14.06 (block definitions)
        └── S-14.07 (canvas solution)
              └── S-14.08 (assets + ATTRIBUTION)
                    └── S-14.09 (e2e verification)
```

## What "Done" Looks Like

A developer clears localStorage, opens the app, and completes the Japan lesson end-to-end without any platform code changes. Every AC in PRD F-01 through F-09 is checked off in S-14.09.
