# E-04: World Map

**Priority:** P0
**Dependencies:** E-01 complete, E-03 complete, E-02 complete
**Goal:** Render an interactive world map where the player sees lesson nodes and navigates between them. All map data comes from the content pack.

The world map is the game's home screen — the hub the player always returns to between lessons. It establishes the pattern for content-driven rendering: the platform reads node positions, edges, and sprites entirely from `course.json` and never hardcodes map layout. Getting this right sets the foundation for how every future map (each content pack ships its own) will render.

## Stories

| # | Story | Size |
|---|-------|------|
| S-04.01 | `MapNode.tsx` — single node with locked/available/completed states | S |
| S-04.02 | `MapEdge.tsx` — SVG line between two node positions | XS |
| S-04.03 | `PlayerMarker.tsx` — player sprite at current node position | XS |
| S-04.04 | `VillainTrail.tsx` — villain last-seen indicator | XS |
| S-04.05 | `MapCanvas.tsx` — main map container with background + all overlays | S |
| S-04.06 | Node click handler — available-node click triggers `onNodeSelect` | XS |
| S-04.07 | Animated player transition — CSS/rAF move to new node on Phase 1 success | S |
| S-04.08 | `MapScreen.tsx` — top-level screen composing all map pieces | XS |

## Dependency Order

```
S-04.02 (MapEdge — no deps)
S-04.03 (PlayerMarker — no deps)
S-04.04 (VillainTrail — no deps)
S-04.01 (MapNode — no deps)
  └── S-04.06 (node click handler — wired inside MapNode)
        └── S-04.05 (MapCanvas — composes Edge, Node, background)
              └── S-04.07 (animated transition — extends MapCanvas/PlayerMarker)
                    └── S-04.08 (MapScreen — top-level composition)
```

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Content-driven coordinate rendering (0-1 normalized → pixels) | S-04.05 | E-14 map layout, any future content pack |
| SVG overlay for non-interactive decorations | S-04.02 | E-10 canvas annotations |
| CSS `position: absolute` over `position: relative` container | S-04.05 | E-13 collection grid |
| `animateTo` prop pattern for triggered animations | S-04.07 | E-11 lesson runner transitions |
| Screen-level composition component | S-04.08 | E-05 Narrative screen, E-11 lesson screen |
