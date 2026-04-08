# E-05: Narrative / Dialogue System

**Priority:** P0
**Dependencies:** E-01 complete, E-03 complete
**Goal:** Story scenes with dialogue, character portraits, and backgrounds play at defined points in each lesson phase.

Lessons would feel empty without this. Every phase boundary — intro, outro, reveal, celebration — is a narrative moment. This system turns raw JSON scene arrays into an engaging, pixel-art cutscene experience. The dialogue box and skip mechanics established here are used by every lesson in every content pack.

## Stories

| # | Story | Size |
|---|-------|------|
| S-05.01 | Narrative type definitions | XS |
| S-05.02 | `DialogueBox.tsx` component | S |
| S-05.03 | `PortraitDisplay.tsx` component | XS |
| S-05.04 | `SceneRenderer.tsx` component | S |
| S-05.05 | `NarrativePlayer.tsx` component | S |
| S-05.06 | Skip button | XS |
| S-05.07 | Auto-advance mode | XS |

## Dependency Order

```
S-05.01 (types)
  ├── S-05.02 (DialogueBox)
  │     └── S-05.03 (PortraitDisplay)
  │           └── S-05.04 (SceneRenderer)
  │                 └── S-05.05 (NarrativePlayer)
  │                       ├── S-05.06 (skip button — inside NarrativePlayer)
  │                       └── S-05.07 (auto-advance — SceneRenderer prop)
```

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Scene array rendering from content pack JSON | S-05.04–05 | E-11 phase boundary events |
| Pixel-art dialogue box UI shell | S-05.02 | E-07 "What's this?" tooltip |
| Conditional skip control with accessible label | S-05.06 | E-13 flag reveal animation controls |
| Auto-advance with `useEffect` + `setTimeout` | S-05.07 | E-10 canvas step animation |
