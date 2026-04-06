# CodeQuest Platform — Architecture

**Version:** 0.1 (Planning)
**Status:** Draft
**Last Updated:** 2026-04-06

---

## 1. System Overview

CodeQuest is a fully static, client-side web application. All game logic, lesson execution, and learner progress run in the browser. No backend is required for v1.

```
┌─────────────────────────────────────────────────────────┐
│                      Browser                            │
│                                                         │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────┐  │
│  │  React UI   │   │   Engine     │   │  localStorage│  │
│  │  Components │◄──│  (lesson,    │◄──│  (profile,   │  │
│  │             │   │   progress,  │   │   progress,  │  │
│  │             │   │   content)   │   │   unlocks)   │  │
│  └──────┬──────┘   └──────┬───────┘   └─────────────┘  │
│         │                 │                             │
│  ┌──────▼──────┐   ┌──────▼───────┐                    │
│  │   Blockly   │   │Content Pack  │                    │
│  │   Editor    │   │  (JSON +     │                    │
│  │             │   │   assets)    │                    │
│  └─────────────┘   └──────────────┘                    │
│                                                         │
│  ┌─────────────┐   ┌──────────────┐                    │
│  │   Monaco /  │   │  Canvas      │                    │
│  │  CodeMirror │   │  Renderer    │                    │
│  │  (syntax)   │   │  (HTML5)     │                    │
│  └─────────────┘   └──────────────┘                    │
└─────────────────────────────────────────────────────────┘
```

---

## 2. Tech Stack

### Frontend Framework
**React 18 + Vite + TypeScript**

- React for component-driven UI and state management
- Vite for fast dev server, HMR, and static build output
- TypeScript throughout — strict mode enabled

### Block Editor
**Google Blockly**

- Open-source visual block editor (same engine as Scratch)
- Custom block definitions per content pack (defined in JSON, registered at runtime)
- Phase 2 enhancement: blocks render their simplified-JS syntax inside the block body using Blockly's built-in code generation API
- Blockly workspace serialized to JSON for save/restore

### Syntax Editor
**Monaco Editor** (VS Code's editor, available as a standalone npm package)

- Familiar, professional-grade editing experience
- Syntax highlighting for simplified-JS subset
- Language server / autocomplete can be scoped to allowed API surface
- Unlocked permanently per lesson; persisted in localStorage

### Code Execution
**Custom simplified-JS interpreter (sandboxed)**

- Players write simplified JavaScript (no `var`, no DOM access, no `eval`, no `import`)
- A whitelist-based interpreter evaluates only allowed statements and function calls
- The interpreter calls into the Canvas Renderer API for drawing commands
- Security: code runs in a sandboxed context — no access to `window`, `document`, or platform internals
- Implementation options (evaluate during architecture spike):
  - `acorn` AST parser + custom tree-walking interpreter
  - `vm2` or `isolated-vm` (if a Node backend is introduced)
  - `QuickJS` compiled to WASM (preferred stretch goal — enables future custom language support)

### Canvas Renderer
**HTML5 Canvas API**

- A `<canvas>` element is the output surface for Phase 3 code
- The renderer exposes a typed API to the interpreter (e.g. `fillBackground`, `drawRect`, `drawCircle`, `drawStripe`)
- The available functions for each lesson are declared in lesson JSON — only whitelisted functions are callable
- Success evaluation: semantic (compare called drawing commands to expected solution), not pixel-diff

### Styling
**Tailwind CSS**

- Utility-first, works well with Vite and component-driven React
- Pixel-art aesthetic achieved via custom font (e.g. Press Start 2P from Google Fonts) and CSS image rendering settings (`image-rendering: pixelated`)

### State Management
**React Context + useReducer**

- Learner profile, lesson progress, and active phase state managed via Context
- No external state library needed for v1 scope
- Upgrade path: Zustand if state grows complex

### Persistence
**localStorage (v1)**

- Learner profile (name, active course)
- Per-lesson unlock state (phases completed, syntax editor unlocked, flag collected)
- XP total and collection

Schema key prefix: `codequest:` (e.g. `codequest:profile`, `codequest:progress:flag-hunter:001-japan`)

### Sprites & Assets
**OpenGameArt.org**

- Primary source for CC-licensed pixel art sprites (character, villain, world map elements)
- Assets committed to the content pack's `assets/` folder
- Attribution tracked in `content/flag-hunter/ATTRIBUTION.md`
- Sprite sheets handled via CSS sprite maps or a lightweight sprite library (e.g. `pixi.js` sprites — evaluate during spike)

---

## 3. Repository Structure

```
codequest-platform/
├── docs/                         Planning documents
├── public/                       Static assets (favicon, global sprites)
├── src/
│   ├── main.tsx                  Vite entry point
│   ├── App.tsx                   Root component, routing
│   ├── engine/
│   │   ├── contentLoader.ts      Loads and validates content pack JSON
│   │   ├── lessonRunner.ts       Manages active lesson phase state machine
│   │   ├── progressStore.ts      localStorage read/write for all progress
│   │   └── interpreter/
│   │       ├── interpreter.ts    Simplified-JS AST walker / executor
│   │       └── sandbox.ts        Whitelist enforcement, API injection
│   ├── components/
│   │   ├── Profile/              Name entry and settings
│   │   ├── Map/                  World map + node rendering
│   │   ├── HUD/                  XP display, learner name, current location
│   │   ├── Narrative/            Dialogue / cutscene renderer
│   │   └── Collection/           Flag collection gallery
│   ├── editor/
│   │   ├── BlockEditor.tsx       Blockly wrapper component
│   │   ├── SyntaxEditor.tsx      Monaco wrapper component
│   │   ├── EditorToggle.tsx      Block ↔ syntax view toggle
│   │   └── blockRegistry.ts      Registers custom Blockly block types from content pack
│   ├── renderer/
│   │   ├── CanvasRenderer.tsx    HTML5 canvas output component
│   │   ├── rendererAPI.ts        Typed drawing API injected into interpreter
│   │   └── successEvaluator.ts   Compares player output to lesson solution
│   └── types/
│       └── content.ts            TypeScript types mirroring content JSON schema
├── content/
│   └── flag-hunter/
│       ├── course.json           Course metadata, lesson index, map config
│       ├── ATTRIBUTION.md        Sprite and asset credits
│       └── lessons/
│           └── 001-japan/
│               ├── lesson.json   Full lesson definition (all 3 phases)
│               └── assets/       Sprites, background images for this lesson
└── vite.config.ts
```

---

## 4. Lesson Phase State Machine

```
         ┌──────────────┐
         │  Map View    │
         └──────┬───────┘
                │ select available node
         ┌──────▼───────┐
         │  Phase 1     │  Blocks only
         │  Navigate    │  → run code → animate travel
         └──────┬───────┘
                │ success
         ┌──────▼───────┐
         │  Phase 2     │  Blocks + syntax visible inside
         │  Investigate │  → solve puzzle → reveal clue
         └──────┬───────┘
                │ success → permanently unlock syntax editor
         ┌──────▼───────┐
         │  Phase 3     │  Syntax editor primary
         │  Restore     │  → run code → canvas output
         └──────┬───────┘
                │ success
         ┌──────▼───────┐
         │  Celebration │  flag unlocked, XP awarded
         └──────┬───────┘
                │
         ┌──────▼───────┐
         │  Map View    │  node marked complete, next node(s) unlocked
         └──────────────┘
```

---

## 5. Content Pack Architecture

Content packs are **self-contained directories** under `content/`. The platform engine imports the active pack's `course.json` at build time (v1) or runtime (future).

Each pack defines:
- Course metadata (title, description, villain, theme)
- World map (background image, node positions, connections)
- Lesson index (ordered list with unlock dependencies)
- Per-lesson: all 3 phases, narrative scripts, block definitions, canvas API surface, solution definition

See [CONTENT_SCHEMA.md](CONTENT_SCHEMA.md) for full JSON schema.

### Content Pack Loading (v1 vs future)

| Version | Loading Method                                               |
| ------- | ------------------------------------------------------------ |
| v1      | Static import — content pack is bundled at build time        |
| v2      | Dynamic import — content packs loaded from `/content/` at runtime |
| v3      | Remote loading — content packs fetched from a URL or database |

---

## 6. Code Execution Security

Player-written code is never `eval()`d directly. Execution pipeline:

1. Player code (simplified JS string) → `acorn` parser → AST
2. AST walker checks all nodes against a whitelist of allowed statement types and identifiers
3. Whitelisted AST is executed by a custom tree-walking interpreter
4. Interpreter has access only to the injected Canvas Renderer API functions
5. No `window`, `document`, `fetch`, `localStorage`, or platform internals accessible

---

## 7. Deployment

### GitHub Pages (v1)

- `vite.config.ts` sets `base: '/codequest-platform/'`
- GitHub Actions workflow builds and deploys to `gh-pages` branch
- Custom domain `byram.dev` is configured on the personal-website repo (root)
- `codequest-platform` deploys to `byram.dev/codequest-platform/` as a project page — no conflict with the root site

### Future: Firebase

If server-side features are needed (auth, cross-device sync, classroom management):
- Firebase Auth for learner accounts
- Firestore for progress sync
- Firebase Hosting as an alternative to GitHub Pages
- Firebase is already available via the author's Google Cloud account

---

## 8. Key Technical Decisions & Rationale

| Decision         | Choice                 | Rationale                                                    |
| ---------------- | ---------------------- | ------------------------------------------------------------ |
| Block editor     | Blockly                | Battle-tested, extensible, same engine as Scratch; avoids months of custom work |
| Syntax editor    | Monaco                 | Best-in-class browser editor; familiar to developers; good TypeScript API |
| Code execution   | Custom AST interpreter | Security (no eval); sandboxing; ability to intercept and animate each step |
| Language         | Simplified JavaScript  | Transfers to real skills; no translation layer; native to the browser |
| State management | Context + useReducer   | Sufficient for v1 scope; no external library overhead        |
| Persistence      | localStorage           | Zero infrastructure for v1; clear upgrade path to Firebase   |
| Styling          | Tailwind CSS           | Fast iteration; works well with Vite; pixel-art aesthetic achievable |
| Sprites          | OpenGameArt.org        | CC-licensed; large library; pixel art focus                  |