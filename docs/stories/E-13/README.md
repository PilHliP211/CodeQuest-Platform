# E-13: Flag Collection UI

**Priority:** P1
**Dependencies:** E-03 (content pack for flag list), E-12 (progress store for collected state)
**Goal:** A gallery view showing all flags in the course — collected ones in full color, uncollected as silhouettes — accessible from the map screen.

The collection screen is the learner's trophy case. After completing a lesson and watching the celebration animation, the child can pop open the gallery and see their flag in full color alongside the ones still to unlock. Getting this right — the pixel-art tile frame, the reveal animation, the silhouette mystery — is key to making completion feel rewarding.

## Stories

| # | Story | Size |
|---|-------|------|
| S-13.01 | `CollectedFlag` and `CollectionState` types | XS |
| S-13.02 | `FlagTile.tsx` — single tile, collected vs. uncollected states | S |
| S-13.03 | `CollectionGrid.tsx` — full gallery with counter | S |
| S-13.04 | New flag reveal animation | S |
| S-13.05 | Collection screen navigation (map → collection → map) | XS |

## Dependency Order

```
S-13.01 (types)
  └── S-13.02 (FlagTile)
        └── S-13.03 (CollectionGrid)
              ├── S-13.04 (reveal animation — extends FlagTile/Grid)
              └── S-13.05 (navigation — wires Grid into MapScreen)
```

## Epic Validation

**Human Testable Increment:** Run `npm run dev`, open the map, click Collection, and see the course's flags as collected or uncollected based on progress. With Japan uncollected, the tile is a silhouette with mystery text; after seeding or earning Japan completion, the tile shows the full-color flag, collection count, completion date, and first-collection reveal animation.

**Automated Validation:** Add component tests for `FlagTile`, `CollectionGrid`, reveal animation state, accessible collection navigation from the map, Escape/back behavior, and progress-driven collected/uncollected rendering. Use the Flag Hunter fixture in tests; keep platform code pack-agnostic.

**Temporary Surface Decision:** The collection button on MapScreen is product UI, so no dev harness should be needed. If progress seeding is needed before E-14, keep it in test helpers or dev-only setup, not in production collection logic.

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| CSS `image-rendering: pixelated` flag display | S-13.02 | All future flag/icon tiles |
| `useEffect` watching store slice for new additions | S-13.04 | E-16 authoring live preview, future achievement system |
| Overlay screen with Back button | S-13.05 | Any future full-screen modal from MapScreen |
