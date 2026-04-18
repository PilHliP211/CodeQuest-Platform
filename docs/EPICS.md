# CodeQuest Platform — Epics

**Version:** 0.1 (Planning)
**Status:** Draft
**Last Updated:** 2026-04-13

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

## Epic Validation Rule

Every remaining epic (E-06 onward) must end with both:

- **Human Testable Increment:** `npm run dev` exposes a product screen or clearly named temporary dev harness where a developer can verify behavior meaningfully changed since the previous epic.
- **Automated Validation:** unit, component, invariant, or E2E tests validate that same behavior at the cheapest reliable layer.

Temporary routes such as `/__dev/interpreter` are allowed for foundational work, but they must be documented as dev-only and removed or folded into the product path once the relevant lesson screen exists.

### Temporary Dev Harness Convention

All future temporary dev harnesses must be isolated so cleanup is mechanical:

- Put harness screens, harness-only loaders, and route-only helpers in `src/devHarnesses/`.
- Put harness-only content fixtures in `content/flag-hunter/dev-harnesses/`.
- Route harnesses from `App.tsx` using `/__dev/...`.
- Do not place harness files beside production components, engine modules, renderer modules, or lesson code.
- The epic that replaces a harness with product UI must delete the matching `/__dev/...` route, its App test coverage, `src/devHarnesses/` files, and `content/flag-hunter/dev-harnesses/` fixtures that are no longer needed.

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

**Human Testable Increment:** `npm run dev` opens a lesson editor surface or temporary `/__dev/block-editor` harness where a developer can see Flag Hunter blocks, filter by phase, generate code with Run, and verify the CodeQuest Blockly theme.

**Automated Validation:** Unit tests for block registration/toolbox generation; component tests for block filtering, Run button contract, disabled running state, empty workspace, and serialization.

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

**Human Testable Increment:** `npm run dev` exposes Phase 1 vs. Phase 2 block views, through `LessonScreen` or `/__dev/block-editor?phase=2`, so a developer can see code labels appear only in Phase 2 and can open the tooltip.

**Automated Validation:** Component tests for phase-specific labels, Phase 3 read-only behavior, and tooltip mouse/keyboard accessibility.

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

**Human Testable Increment:** `npm run dev` opens a Phase 3 editor surface or temporary `/__dev/syntax-editor` harness where a developer can type code, switch to read-only blocks, and trigger the fallback after three failures.

**Automated Validation:** Component tests for controlled editor behavior, editor toggle, fallback visibility, read-only blocks messaging, and unlock persistence wiring; unit tests for any autocomplete filtering helpers.

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

**Human Testable Increment:** `npm run dev` exposes code execution through the lesson surface or temporary `/__dev/interpreter` harness where allowed code produces a call log and blocked code produces a friendly learner-facing error.

**Automated Validation:** Unit tests for parser/interpreter outcomes and friendly errors; invariant tests proving the sandbox rejects disallowed identifiers/statements across generated inputs.

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

**Human Testable Increment:** `npm run dev` opens Phase 3 restore or temporary `/__dev/canvas` harness where a developer can run the Japan solution, watch sequential drawing, see success feedback, and reset the canvas.

**Automated Validation:** Unit tests for renderer API, whitelist filtering, sequential animation cancellation, and success evaluation; component tests for canvas/reset behavior without pixel snapshots.

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

**Human Testable Increment:** `npm run dev` lets a developer enter a name, click the Japan map node, land in `LessonScreen`, advance phase state, see hints after failed attempts, and return to the map on completion.

**Automated Validation:** Unit tests for every state-machine transition, invalid transition, hint trigger, narrative selection, and XP calculation; component tests for `LessonContext`/`LessonScreen` visible state changes.

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

**Human Testable Increment:** `npm run dev` lets a developer complete or seed progress, reload, see persisted map/XP/syntax unlock state, then reset progress from Settings while preserving the learner name.

**Automated Validation:** Unit tests for progress store, rehydration, total XP, syntax unlock, reset, and map node derivation; component tests for HUD XP, progress-driven map states, and reset confirmation.

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

**Human Testable Increment:** `npm run dev` exposes Collection from the map; a developer can see Japan as a silhouette before completion and full color with count/date/reveal after completion or seeded progress.

**Automated Validation:** Component tests for `FlagTile`, `CollectionGrid`, reveal animation state, collection navigation, Escape/back behavior, and progress-driven collected/uncollected rendering.

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

**Human Testable Increment:** `npm run dev` supports a full Japan lesson playthrough from fresh localStorage through map, phases 1-3, flag collection, XP, and persisted completion.

**Automated Validation:** Playwright golden-path E2E for the Japan lesson plus content validation tests for the course and lesson JSON.

---

### E-15: GitHub Pages Deployment

**Goal:** The app is deployed to `byram.dev/codequest-platform/` via GitHub Actions on every push to `main`.

**Scope:**
- `vite.config.ts` configured with `base: '/codequest-platform/'`
- GitHub Actions workflow: on push to `main` → `npm ci` → `npm run build` → deploy to `gh-pages` branch
- `gh-pages` branch configured in GitHub repo settings
- Custom domain (`byram.dev`) DNS already configured on personal-website repo; project pages work automatically at subpath
- Smoke test: visit `byram.dev/codequest-platform/` after deploy, confirm app loads

**Human Testable Increment:** The deployed `https://byram.dev/codequest-platform/` app loads from the subpath, accepts a learner name, renders the map, and starts the Japan lesson without asset 404s.

**Automated Validation:** CI build validation plus a Playwright smoke test that can run against local preview with the production base path or a configured deployed base URL.

---

## v2 Epics (Summary)

### E-16: Content Authoring UI
A web-based UI for non-developers to create content packs. Exports valid `course.json` + `lesson.json` files. Allows uploading sprites, writing narrative scripts, defining block types, and configuring the canvas challenge. Targeted at educators and parent developers.

**Human Testable Increment:** `npm run dev` opens an authoring screen where a developer can create or edit a small lesson draft, preview validation errors, and export JSON that can replace the Flag Hunter fixture without platform code changes.

**Automated Validation:** Unit tests for authoring serialization/validation and component tests for form flows, preview errors, and export behavior. Add E2E only for one critical authoring-to-export journey if component tests cannot cover the integration.

### E-17: Multi-Pack Support & Remote Loading
Allow the platform to load multiple content packs and let the learner choose. Enable loading packs from remote URLs or a Firestore database, not just the repo directory.

**Human Testable Increment:** `npm run dev` shows a pack picker with at least the local Flag Hunter pack and one fixture/remote-pack option; switching packs changes the map/course content without editing platform code.

**Automated Validation:** Unit tests for pack discovery/loading/error states and component tests for the picker and selected-pack persistence. Add a mocked-network test for remote loading failures and friendly error display.

---

## v3 Epics (Summary)

### E-18: Custom Language / WASM Compiler
Allow content pack authors to define their own simplified programming language syntax. Compile custom language definitions to a WASM-based interpreter at build time. Enables themed languages ("Minecraft Commands", "Pirate Script", etc.).

**Human Testable Increment:** `npm run dev` exposes a dev-only language playground or lesson preview where a developer can run a tiny custom-language snippet and see the same renderer calls/friendly errors as simplified JavaScript.

**Automated Validation:** Unit/invariant tests for language parsing, compile output, sandbox equivalence, and renderer API isolation. Add fixture-based tests for at least one valid and one invalid custom language definition.

### E-19: Backend & Cross-Device Sync
Firebase Auth + Firestore for learner accounts, cross-device progress sync, and optional classroom/teacher features (view student progress, assign lessons).

**Human Testable Increment:** `npm run dev` exposes an auth/sync development mode where a developer can sign in with a local/emulator account, complete or seed progress, reload in a second browser context, and see the same progress.

**Automated Validation:** Unit tests for sync conflict/merge rules and integration tests against the Firebase emulator or mocked repository layer. E2E should cover one login-sync-restore path once credentials and emulator setup are stable.
