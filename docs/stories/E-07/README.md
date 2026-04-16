# E-07: Syntax Visibility in Blocks (Phase 2)

**Priority:** P0
**Dependencies:** E-06 complete
**Goal:** In Phase 2, each Blockly block displays the equivalent simplified-JS code inside its body, connecting the visual metaphor to real syntax before the player writes code themselves.

This is a small but pedagogically important epic. The transition from blocks to syntax is the core learning arc of the platform. Phase 2 is the bridge — the player still drags blocks, but can now see the actual code each block represents. Getting the visual treatment and the tooltip right here directly affects whether that "aha moment" lands.

## Stories

| # | Story | Size |
|---|-------|------|
| S-07.01 | Phase mode prop on `BlockEditor` | XS |
| S-07.02 | Code label inside block body | S |
| S-07.03 | "What's this?" tooltip | XS |

## Dependency Order

```
S-07.01 (phase prop)
  └── S-07.02 (code label rendering)
        └── S-07.03 (tooltip)
```

## Epic Validation

**Human Testable Increment:** Run `npm run dev` and open the phase-2 block editor from the lesson surface or temporary `/__dev/block-editor?phase=2` harness. The developer must be able to compare Phase 1 and Phase 2: Phase 1 shows normal blocks, while Phase 2 shows each block's code label plus a "What's this?" tooltip that explains why the labels are present.

**Automated Validation:** Add component tests covering the phase mode contract: Phase 1 omits code labels, Phase 2 shows labels from the content pack, Phase 3 sets the block view read-only, and the tooltip toggles by mouse and keyboard with accessible roles/relationships.

**Temporary Surface Decision:** The phase query on a dev harness is acceptable until the real lesson runner can move between phases. Remove the query harness once E-11 exposes Phase 2 through `LessonScreen`.

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Phase-aware rendering prop | S-07.01 | E-08 `EditorToggle`, E-11 lesson runner |
| Sub-label inside Blockly block | S-07.02 | Any future custom block annotation |
| Accessible tooltip / popover | S-07.03 | E-08 syntax editor help text, E-10 canvas hints |
