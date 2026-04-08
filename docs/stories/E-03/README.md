# E-03: Content Pack Loading

**Priority:** P0
**Dependencies:** E-01 complete, E-02 complete (context and gate patterns)
**Goal:** The platform reads all game data from a content pack JSON. No hardcoded lesson content anywhere in platform code.

This epic gives the platform its game data. It establishes the TypeScript type boundary between raw JSON and the app, and introduces the content context that every downstream epic (World Map, Narrative, Block Editor, Lesson Runner) will consume. The key design rule: the platform never knows lesson details — it only knows the shape of a content pack. Swapping the content folder should produce an entirely different game without touching a single line of platform code.

## Stories

| # | Story | Size |
|---|-------|------|
| S-03.01 | Content pack TypeScript types (`src/types/content.ts`) | XS |
| S-03.02 | `isCourse` type guard | XS |
| S-03.03 | `contentLoader.ts` — load and validate course JSON | S |
| S-03.04 | `ContentContext.tsx` — React context provider | S |
| S-03.05 | `useContent` hook | XS |
| S-03.06 | Content load error gate | XS |
| S-03.07 | Wire `ContentProvider` into `main.tsx` + swap test | XS |

## Dependency Order

```
S-03.01 (types)
  └── S-03.02 (type guard)
        └── S-03.03 (contentLoader)
              └── S-03.04 (ContentContext)
                    └── S-03.05 (useContent hook)
                          ├── S-03.06 (error gate → App.tsx)
                          └── S-03.07 (wire into main.tsx)
```

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Deep content-pack type hierarchy | S-03.01 | E-04 map, E-05 narrative, E-06 blocks, E-11 lesson runner |
| Type guard for complex JSON objects | S-03.02 | E-12 progress guard, E-14 content pack validation |
| Static JSON import with validation | S-03.03 | E-17 remote pack loading (replaces import with fetch) |
| React context for engine-level data | S-03.04 | E-11 lesson runner context, E-12 progress context |
| Hook with provider enforcement | S-03.05 | All future engine contexts |
| Full-screen error gate | S-03.06 | Any future fatal startup error |
