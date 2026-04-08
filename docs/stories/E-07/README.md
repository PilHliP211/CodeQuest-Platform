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

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Phase-aware rendering prop | S-07.01 | E-08 `EditorToggle`, E-11 lesson runner |
| Sub-label inside Blockly block | S-07.02 | Any future custom block annotation |
| Accessible tooltip / popover | S-07.03 | E-08 syntax editor help text, E-10 canvas hints |
