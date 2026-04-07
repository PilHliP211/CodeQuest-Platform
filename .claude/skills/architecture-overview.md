---
name: architecture-overview
description: Top-level directory layout and the four hard architectural rules. Load when navigating the codebase or deciding where new code goes.
---

# Architecture Overview

Full details: `docs/ARCHITECTURE.md`.

## Directory Layout

```
src/
  engine/         # Core logic: content loading, lesson runner, progress, interpreter
    interpreter/  # AST walker + sandbox
  components/     # React UI (Profile/, Map/, HUD/, Narrative/, Collection/)
  editor/         # Blockly + Monaco editor wrappers
  renderer/       # Canvas renderer + success evaluator
  types/          # Cross-module TypeScript types
content/          # Content packs (JSON + assets)
docs/             # Planning documents
.claude/skills/   # Agent guidance (this file lives here)
```

## Four Hard Rules

1. **Content drives everything.** Lesson-specific data lives in JSON content packs, never platform code. See `content-pack-system` skill.

2. **No `eval`, ever.** Player code is parsed to AST by `acorn`, whitelist-validated, then tree-walked by a custom interpreter. No `eval()`, no `Function()`, no `vm2`.

3. **Inject only what's allowed.** The interpreter receives only the drawing functions declared in the current lesson's `availableFunctions`. `window`, `document`, `localStorage`, `fetch` are unreachable.

4. **localStorage is typed and validated.** All keys use `codequest:` prefix. All reads go through `storage.ts` with a type guard. See `localstorage-pattern` skill.

## Where Things Go

| New code | Lives in |
|----------|----------|
| Domain logic, no UI | `src/engine/` |
| React component | `src/components/{Area}/` |
| Block / syntax editor wrapper | `src/editor/` |
| Drawing function or canvas logic | `src/renderer/` |
| Type used by ≥2 modules | `src/types/` |
| Type used by 1 module | Inside that module |
| Lesson narrative, block def, success condition | Content pack JSON |

## Tech Stack

- React 18 + Vite + TypeScript (strict)
- Google Blockly (visual blocks)
- Monaco Editor (syntax)
- `acorn` parser + custom AST walker (player code execution)
- HTML5 Canvas (rendering)
- Tailwind CSS + Press Start 2P font
- localStorage (persistence)
