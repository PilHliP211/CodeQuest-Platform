# CodeQuest Platform — Epics

**Version:** 0.1 (Planning)
**Status:** Draft
**Last Updated:** 2026-04-06

---

## Epic Overview

| #    | Epic                                    | Phase | Priority |
| ---- | --------------------------------------- | ----- | -------- |
| E-01 | Platform Shell & Dev Setup              | v1    | P0       |
| E-02 | Learner Profile                         | v1    | P0       |
| E-03 | Content Pack Loading                    | v1    | P0       |
| E-04 | World Map                               | v1    | P0       |
| E-05 | Narrative / Dialogue System             | v1    | P0       |
| E-06 | Block Editor (Blockly)                  | v1    | P0       |
| E-07 | Syntax Visibility in Blocks (Phase 2)   | v1    | P0       |
| E-08 | Syntax Editor (Phase 3)                 | v1    | P0       |
| E-09 | Code Interpreter & Sandbox              | v1    | P0       |
| E-10 | Canvas Renderer                         | v1    | P0       |
| E-11 | Lesson Runner & Phase State Machine     | v1    | P0       |
| E-12 | Progression & Persistence               | v1    | P0       |
| E-13 | Flag Collection UI                      | v1    | P1       |
| E-14 | First Content Pack — Flag Hunter: Japan | v1    | P0       |
| E-15 | GitHub Pages Deployment                 | v1    | P1       |
| E-16 | Content Authoring UI                    | v2    | P2       |
| E-17 | Multi-Pack Support & Remote Loading     | v2    | P2       |
| E-18 | Custom Language / WASM Compiler         | v3    | P3       |
| E-19 | Backend & Cross-Device Sync             | v3    | P3       |

---

## v1 Epics (Detailed)

---

### E-01: Platform Shell & Dev Setup

**Goal:** A working React + Vite + TypeScript project with folder structure, linting, formatting, and CI in place. The foundation everything else is built on.

**Scope:**
- Initialize Vite + React + TypeScript project
- Configure ESLint, Prettier, strict TypeScript
- Set up folder structure per ARCHITECTURE.md
- Configure Tailwind CSS
- Set up Google Fonts (Press Start 2P for pixel-art aesthetic)
- Configure Vite base path for GitHub Pages subpath deployment
- Add GitHub Actions CI workflow (lint + build on PR)
- Add `.gitignore`, `LICENSE`, basic `README.md` at repo root

**AC highlights:**
- `npm run dev` starts local dev server
- `npm run build` produces a deployable static build
- `npm run lint` passes with no errors on a fresh clone
- Folder structure matches ARCHITECTURE.md exactly

---

### E-02: Learner Profile

**Goal:** Kids (or the adult setting up for them) can enter a name. The name persists across sessions and appears in the UI.

**Scope:**
- First-launch name entry screen (blocks game until name is set)
- Name stored in localStorage under `codequest:profile`
- Name displayed in HUD during gameplay
- Settings screen with name-change option (no progress reset)
- TypeScript type for `LearnerProfile`

**AC highlights:** See PRD F-01

---

### E-03: Content Pack Loading

**Goal:** The platform reads all game data from a content pack JSON. No hardcoded lesson content anywhere in platform code.

**Scope:**
- `contentLoader.ts` — imports and validates `course.json` at startup
- TypeScript types matching full content schema (`src/types/content.ts`)
- JSON schema validation with friendly error messages
- React Context exposes loaded content pack to all components
- Swap test: changing content pack folder produces different course with zero platform code changes

**AC highlights:** See PRD F-02

---

### E-04: World Map

**Goal:** An interactive world map where the player sees lesson nodes and navigates between them. The map is content-defined.

**Scope:**
- `Map/` component renders content pack's `map.backgroundImage`
- Node rendering with 3 states: locked (greyed), available (highlighted), completed (flag icon)
- Node positions from content pack coordinates
- Click handler on available nodes → triggers lesson start
- Player position indicator (sprite on current node)
- Edge lines between connected nodes
- Animated transition when player moves to a new node (Phase 1 success)
- Villain "last seen" trail indicator on map

**AC highlights:** See PRD F-03

---

### E-05: Narrative / Dialogue System

**Goal:** Story scenes with dialogue, character portraits, and backgrounds play at defined points in each lesson phase.

**Scope:**
- `Narrative/` component renders scene arrays from lesson JSON
- Dialogue box with speaker name, text, optional portrait
- Click/tap to advance through dialogue lines
- Scene background image support
- Auto-advance option (timed) vs. input-advance
- Skip button (for replays)
- Pixel-art styled dialogue box UI

**Dependencies:** E-01, E-03

---

### E-06: Block Editor (Blockly)

**Goal:** A Blockly-powered visual block editor, with custom block types loaded from the lesson's block definitions.

**Scope:**
- `BlockEditor.tsx` wraps Blockly workspace
- `blockRegistry.ts` reads lesson `blocks` array and registers custom Blockly block types at runtime
- Block palette shows only `availableBlocks` for the current phase
- "Run" button executes the workspace → generates simplified-JS code string → passes to interpreter
- Workspace state serialized to/from JSON (for save/restore mid-lesson)
- Accessible, keyboard-navigable where possible
- Pixel-art themed Blockly toolbox styling

**Dependencies:** E-01, E-03, E-09

---

### E-07: Syntax Visibility in Blocks (Phase 2)

**Goal:** In Phase 2, each block displays the equivalent simplified-JS code inside its body, connecting visual blocks to real syntax.

**Scope:**
- Phase-aware rendering mode in `BlockEditor.tsx`
- When `phase === 2`, blocks render their `code` field as a text label inside the block
- Code text is styled distinctly (monospace, small, slightly transparent)
- Blocks remain functional (drag, connect, run) with syntax visible
- "What's this?" tooltip explaining the concept of code inside blocks

**Dependencies:** E-06

---

### E-08: Syntax Editor (Phase 3)

**Goal:** A Monaco-powered syntax editor unlocked in Phase 3, with a read-only blocks view always available as reference.

**Scope:**
- `SyntaxEditor.tsx` wraps Monaco Editor
- Language configured as JavaScript with restricted autocomplete (only `availableFunctions`)
- `EditorToggle.tsx` — tab/toggle between syntax editor and read-only Blockly view
- Syntax editor unlocked per-lesson (stored in localStorage); once unlocked, always unlocked for that lesson
- "Show me in blocks" fallback appears after 3 failed run attempts
- Blocks view in Phase 3 is read-only (cannot run from blocks)

**Dependencies:** E-06, E-07, E-12

---

### E-09: Code Interpreter & Sandbox

**Goal:** Player-written simplified-JS code is safely executed in a sandboxed environment that calls into the Canvas Renderer API.

**Scope:**
- `interpreter.ts` — AST-walking interpreter using `acorn` as the parser
- `sandbox.ts` — whitelist enforcement; rejects any identifier or statement not allowed
- Interpreter injects only the lesson's `availableFunctions` into execution scope
- Execution errors return typed error objects with player-friendly messages (not stack traces)
- Step-by-step execution mode (for future animation sequencing)
- Unit-tested interpreter (happy path + security boundary tests)

**AC highlights:**
- `window`, `document`, `localStorage`, `fetch`, `eval` are inaccessible
- Unknown function calls return a friendly "That function isn't available here" error
- Syntax errors return a friendly parse error pointing to the line

---

### E-10: Canvas Renderer

**Goal:** Player code drives animated visual output on an HTML5 canvas, rendering the flag being restored.

**Scope:**
- `CanvasRenderer.tsx` — renders `<canvas>` element with correct dimensions from lesson JSON
- `rendererAPI.ts` — implements all possible drawing functions (`fillBackground`, `drawRect`, `drawCircle`, `drawStripe`, `drawTriangle`, etc.)
- API is injected into the interpreter; only `availableFunctions` for the current lesson are exposed
- Each drawing call animates sequentially (brief delay between steps) for visual feedback
- `successEvaluator.ts` — semantic comparison of player's drawing calls vs. solution (with tolerance for numeric args)
- "Reset canvas" button clears and reruns

**Dependencies:** E-09

---

### E-11: Lesson Runner & Phase State Machine

**Goal:** A central state machine that manages the player's progress through the 3 phases of a lesson, coordinating all subsystems.

**Scope:**
- `lessonRunner.ts` — manages current phase, attempt count, hint availability
- Phase transitions triggered by success conditions from each subsystem (map navigation, puzzle solve, canvas success)
- Attempt counter per phase; triggers hint display after N attempts; triggers fallback after N (Phase 3)
- Emits events consumed by the Narrative system (intro/outro scenes at phase boundaries)
- XP awarded at phase and lesson completion per content pack config

**Dependencies:** E-03, E-04, E-05, E-06, E-08, E-09, E-10

---

### E-12: Progression & Persistence

**Goal:** All learner progress — completed phases, unlocked syntax editors, collected flags, XP — is stored in localStorage and restored on next visit.

**Scope:**
- `progressStore.ts` — typed read/write wrapper for localStorage
- Schema: `codequest:profile`, `codequest:progress:{packId}:{lessonId}`
- Per-lesson state: `{ phase1Complete, phase2Complete, phase3Complete, syntaxUnlocked, flagCollected, xpEarned }`
- World map node states derived from progress store at runtime
- Progress survives page refresh and browser restart
- "Reset progress" option in settings (with confirmation)

**AC highlights:** See PRD F-08

---

### E-13: Flag Collection UI

**Goal:** A gallery view showing all flags in the course — collected ones in full color, uncollected as silhouettes.

**Scope:**
- `Collection/` component
- Accessible from main menu or map screen
- Collected flags: full color, country name, completion date
- Uncollected flags: silhouette with "???" label
- Pixel-art frame/border around each flag tile
- Animated "new flag!" reveal when first added

**AC highlights:** See PRD F-07

---

### E-14: First Content Pack — Flag Hunter: Japan

**Goal:** A complete, playable lesson for Japan that exercises all three phases and validates the full platform end-to-end.

**Scope:**
- `content/flag-hunter/course.json` — course with 1 lesson node (Japan), world map config, villain config
- `content/flag-hunter/lessons/001-japan/lesson.json` — full 3-phase lesson per schema
- All narrative scripts written for Phase 1, 2, and 3
- Block definitions for: `moveEast`, `moveWest`, `moveNorth`, `moveSouth`, `searchArea`, `collectItem`, `fillBackground`, `drawCircle`
- Canvas solution: `fillBackground("white")` + `drawCircle(150, 100, 60, "red")`
- World map background image (world map, minimal pixel art)
- Player sprite and villain sprite sourced from OpenGameArt.org
- Japan flag icon for collection

**This epic is the integration test for the entire platform.**

---

### E-15: GitHub Pages Deployment

**Goal:** The app is deployed to `byram.dev/codequest-platform/` via GitHub Actions on every push to `main`.

**Scope:**
- `vite.config.ts` configured with `base: '/codequest-platform/'`
- GitHub Actions workflow: on push to `main` → `npm ci` → `npm run build` → deploy to `gh-pages` branch
- `gh-pages` branch configured in GitHub repo settings
- Custom domain (`byram.dev`) DNS already configured on personal-website repo; project pages work automatically at subpath
- Smoke test: visit `byram.dev/codequest-platform/` after deploy, confirm app loads

---

## v2 Epics (Summary)

### E-16: Content Authoring UI
A web-based UI for non-developers to create content packs. Exports valid `course.json` + `lesson.json` files. Allows uploading sprites, writing narrative scripts, defining block types, and configuring the canvas challenge. Targeted at educators and parent developers.

### E-17: Multi-Pack Support & Remote Loading
Allow the platform to load multiple content packs and let the learner choose. Enable loading packs from remote URLs or a Firestore database, not just the repo directory.

---

## v3 Epics (Summary)

### E-18: Custom Language / WASM Compiler
Allow content pack authors to define their own simplified programming language syntax. Compile custom language definitions to a WASM-based interpreter at build time. Enables themed languages ("Minecraft Commands", "Pirate Script", etc.).

### E-19: Backend & Cross-Device Sync
Firebase Auth + Firestore for learner accounts, cross-device progress sync, and optional classroom/teacher features (view student progress, assign lessons).