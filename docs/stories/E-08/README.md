# E-08: Syntax Editor (Phase 3)

**Priority:** P0
**Dependencies:** E-06 complete, E-07 complete, E-12 complete (for unlock persistence)
**Goal:** A Monaco-powered syntax editor becomes the primary coding interface in Phase 3, with a read-only blocks view always available as a reference. Once unlocked per-lesson, the syntax editor is permanently available.

This epic is where kids write real JavaScript for the first time. The editor must feel professional but not overwhelming: autocomplete is restricted to only the lesson's available functions, the blocks view is always one click away as a safety net, and a friendly fallback appears after repeated failures. Monaco is large (~2 MB); lazy loading is required.

## Stories

| # | Story | Size |
|---|-------|------|
| S-08.01 | Install Monaco Editor + skeleton component | S |
| S-08.02 | `SyntaxEditor.tsx` full implementation | S |
| S-08.03 | `EditorToggle.tsx` tab bar component | S |
| S-08.04 | Restrict autocomplete to `availableFunctions` | S |
| S-08.05 | Syntax editor unlock persistence | XS |
| S-08.06 | "Show me in blocks" fallback after 3 failures | XS |

## Dependency Order

```
S-08.01 (Monaco installed + skeleton)
  └── S-08.02 (SyntaxEditor full impl)
        ├── S-08.03 (EditorToggle tab bar)
        │     └── S-08.06 (blocks fallback wired to attempt count)
        └── S-08.04 (restricted autocomplete)
S-08.05 (unlock persistence — depends on E-12 progressStore, parallel with S-08.02+)
```

## Patterns Established Here

| Pattern | Story | Reused By |
|---------|-------|-----------|
| Lazy-loaded heavy component (Monaco) | S-08.01 | Any future large-bundle component |
| Controlled editor component with `value`/`onChange` | S-08.02 | E-11 lesson runner code state |
| Monaco completion item provider | S-08.04 | E-18 custom language (future) |
| Attempt-count-driven UI state | S-08.06 | E-11 hint system |
