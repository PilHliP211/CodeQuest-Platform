# E-06: Block Editor (Blockly)

**Priority:** P0
**Dependencies:** E-01 complete, E-03 complete, E-09 (stub run-code path until E-09 is done)
**Goal:** A Blockly-powered visual block editor with custom block types loaded from the lesson's block definitions.

The block editor is the primary interaction surface for Phase 1 and Phase 2 of every lesson. Players drag-and-drop blocks to write their first programs, so this must feel polished and intentional. The pixel-art theme ties the technical block editor to the game's visual identity. The workspace serialization enables mid-lesson save/restore, which becomes critical in E-12 (Progression).

## Stories

| # | Story | Size |
|---|-------|------|
| S-06.01 | Install and configure Blockly | S |
| S-06.02 | `blockRegistry.ts` — register custom block types | S |
| S-06.03 | `BlockEditor.tsx` — Blockly workspace wrapper | S |
| S-06.04 | Block palette filtering (`availableBlocks`) | XS |
| S-06.05 | Run button + code generation | S |
| S-06.06 | Workspace state serialization | S |
| S-06.07 | Pixel-art Blockly theme | S |

## Dependency Order

```
S-06.01 (install + theme config)
  └── S-06.02 (block registry)
        └── S-06.03 (BlockEditor wrapper)
              ├── S-06.04 (palette filter — extends BlockEditor)
              ├── S-06.05 (run button — extends BlockEditor)
              ├── S-06.06 (serialization — extends BlockEditor)
              └── S-06.07 (pixel-art theme — extends blocklyTheme.ts from S-06.01)
```

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Blockly inject/dispose lifecycle in React | S-06.03 | E-07 phase-aware block rendering |
| `useImperativeHandle` for workspace state access | S-06.06 | E-12 mid-lesson progress save |
| Content-pack-driven toolbox XML/JSON generation | S-06.04 | E-07 block filtering per phase |
| Blockly theme object | S-06.07 | E-07 syntax-visible block styles |
