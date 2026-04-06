# CodeQuest Platform — Product Requirements Document

**Version:** 0.1 (Planning)
**Status:** Draft
**Last Updated:** 2026-04-06

---

## 1. Overview

### Problem

Kids aged 8–12 who have outgrown block-based tools like Scratch have no compelling middle ground before "real" programming languages. Existing options are either too kiddy, too abstract, or too text-heavy for kids who learn best through play, narrative, and immediate visual feedback.

### Solution

CodeQuest is a story-driven, gamified coding platform where kids write real (simplified) code to drive outcomes in an animated game world. The first content pack teaches foundational programming concepts through a globe-trotting villain chase, where players reconstruct stolen national flags using code.

### Target Users

| User                 | Description                                                  |
| -------------------- | ------------------------------------------------------------ |
| **Primary Learner**  | Kids aged 8–12, especially those who've dabbled in Scratch   |
| **Content Creator**  | Developer or educator authoring a content pack (structured JSON + assets) |
| **Parent / Teacher** | Sets up the learner profile; monitors progress informally    |

---

## 2. Goals

### v1 Goals
- Deliver a fully playable single lesson (Japan) end-to-end
- Prove out the 3-phase lesson structure
- Validate the block-editor → syntax-editor progression mechanic
- Establish the content pack schema and folder conventions
- Deploy as a static site embeddable in a personal site

### Non-Goals (v1)
- User accounts or server-side persistence
- Content authoring UI
- Multiple simultaneous content packs
- Custom language / WASM compiler
- Multiplayer or social features
- Mobile-native app

---

## 3. Core Concepts

### 3.1 Content Pack

All story, lesson, map, sprite, and progression data is defined in a **content pack** — a folder of JSON files and assets. The platform engine is completely content-agnostic. The first content pack is **Flag Hunter**.

### 3.2 Learner Profile

A named profile stored in localStorage. The name is configurable so the platform can be reused for different kids. Stores: learner name, current course, per-lesson unlock state, collected flags/items, XP.

### 3.3 Lesson Structure

Every lesson has exactly **3 phases**:

| Phase | Name            | Purpose                                                      | Editor Mode                     |
| ----- | --------------- | ------------------------------------------------------------ | ------------------------------- |
| 1     | **Navigate**    | Introduce the new coding concept; player writes code to travel the world map to the target country | Blocks only                     |
| 2     | **Investigate** | Puzzle to find the flag's "ingredients" or restoration clues; blocks display their underlying syntax ("peek inside") | Blocks with syntax visible      |
| 3     | **Restore**     | Player writes code to reconstruct the flag on the canvas; syntax editor unlocked; blocks available as fallback after 3 failed attempts | Syntax editor (blocks fallback) |

### 3.4 World Map

A content-defined world map with **nodes** representing lesson locations. Nodes have states: locked, available, completed. The player navigates between nodes by writing code (Phase 1). The map is a core v1 feature, not a cutscene.

### 3.5 Block Editor

Powered by **Google Blockly**. Custom block types are defined per content pack. In Phase 2, each block displays the equivalent code syntax inside it. This teaches the connection between visual blocks and real code before the syntax editor is unlocked.

### 3.6 Syntax Editor

A code editor (Monaco or CodeMirror) unlocked permanently per lesson upon completing Phase 2. Uses simplified JavaScript syntax. After 3 failed attempts, a "Show me in blocks" option appears. The block view is always available as a read-only reference.

### 3.7 Canvas Renderer

An HTML5 Canvas-based output area where code drives visual results. The drawable API surface is defined per content pack (e.g. `fillBackground`, `drawCircle`, `drawRect`, `drawStripe`). For Flag Hunter, the canvas renders national flags.

---

## 4. Features & Acceptance Criteria

---

### F-01: Learner Profile Setup

**Description:** On first launch, prompt the learner to enter their name. Store in localStorage. Allow changing the name from settings.

**Acceptance Criteria:**

- [ ] AC-01.1: On first launch (no localStorage profile), a name entry screen is shown before any game content
- [ ] AC-01.2: Learner name is stored in localStorage under a defined key
- [ ] AC-01.3: Learner name is displayed in the UI (header or HUD) during gameplay
- [ ] AC-01.4: A settings option allows the name to be changed at any time
- [ ] AC-01.5: Changing the name does not reset progress

---

### F-02: Content Pack Loading

**Description:** The platform loads a content pack from the repo's `content/` directory at startup. The pack defines the course, lessons, map, narrative, blocks, and canvas challenges.

**Acceptance Criteria:**

- [ ] AC-02.1: Platform reads `course.json` from the active content pack on load
- [ ] AC-02.2: All lesson metadata, map nodes, and phase configs are derived from the content pack JSON
- [ ] AC-02.3: Missing or malformed content pack produces a clear error state (not a blank screen)
- [ ] AC-02.4: Swapping the content pack folder (and updating the import path) produces a fully different course experience with no platform code changes

---

### F-03: World Map

**Description:** An interactive world map displaying lesson nodes. Nodes are positioned by coordinates defined in the content pack. Players see locked, available, and completed states.

**Acceptance Criteria:**

- [ ] AC-03.1: Map renders all nodes defined in `course.json` at their specified coordinates
- [ ] AC-03.2: Locked nodes are visually distinct (greyed out, no interaction)
- [ ] AC-03.3: Available nodes are visually distinct and clickable
- [ ] AC-03.4: Completed nodes display the unlocked flag/item icon
- [ ] AC-03.5: Clicking an available node navigates to that lesson's Phase 1
- [ ] AC-03.6: Map background image is configurable via content pack
- [ ] AC-03.7: Player's current location is shown on the map

---

### F-04: Lesson — Phase 1 (Navigate)

**Description:** The player is introduced to the lesson's core coding concept through a navigation challenge. They write block-based code to move their character to the target country on the world map.

**Acceptance Criteria:**

- [ ] AC-04.1: Phase 1 opens with a narrative sequence (text + sprites) defined in lesson JSON
- [ ] AC-04.2: The new coding concept is introduced via in-game dialogue or tutorial callout
- [ ] AC-04.3: The block palette shows only the blocks defined for this phase in lesson JSON
- [ ] AC-04.4: Running the player's code triggers an animation of the player character moving on the world map
- [ ] AC-04.5: Correct code (reaches the target node) advances to Phase 2
- [ ] AC-04.6: Incorrect code shows an animated failure state and allows retry
- [ ] AC-04.7: A hint system (defined in lesson JSON) is available after N failed attempts

---

### F-05: Lesson — Phase 2 (Investigate)

**Description:** The player solves a puzzle to discover the flag's restoration ingredients or clues. Blocks display their code syntax inside them.

**Acceptance Criteria:**

- [ ] AC-05.1: Phase 2 opens with narrative content defined in lesson JSON
- [ ] AC-05.2: All blocks in Phase 2 display their equivalent simplified-JS syntax inside the block body
- [ ] AC-05.3: The puzzle challenge and success condition are defined entirely in lesson JSON
- [ ] AC-05.4: Solving the puzzle triggers a narrative reveal (the flag ingredients / location)
- [ ] AC-05.5: Completing Phase 2 permanently unlocks the syntax editor for this lesson (stored in localStorage)
- [ ] AC-05.6: Player advances to Phase 3 upon puzzle completion

---

### F-06: Lesson — Phase 3 (Restore)

**Description:** The player writes code to reconstruct the flag on the canvas renderer. The syntax editor is now the primary interface.

**Acceptance Criteria:**

- [ ] AC-06.1: Phase 3 opens with narrative content and a visual "broken" or blank flag state
- [ ] AC-06.2: The syntax editor is shown as the primary coding interface
- [ ] AC-06.3: A "View in Blocks" toggle is always available and shows read-only Blockly representation of the current code
- [ ] AC-06.4: Running code executes the simplified-JS program and updates the canvas in real time
- [ ] AC-06.5: The canvas API surface available to the player is defined in lesson JSON (e.g. which drawing functions are allowed)
- [ ] AC-06.6: Success is evaluated by comparing the canvas output to the target flag definition (pixel comparison or semantic check — TBD in architecture)
- [ ] AC-06.7: After 3 failed run attempts, a "Need help? Try blocks" option appears
- [ ] AC-06.8: Successful flag restoration triggers a celebration animation and unlocks the flag in the learner's collection
- [ ] AC-06.9: Lesson completion awards XP and updates the world map node to completed state

---

### F-07: Flag Collection

**Description:** Completed flags are added to a persistent collection visible from the main menu or map.

**Acceptance Criteria:**

- [ ] AC-07.1: Each completed lesson adds its flag to the learner's collection in localStorage
- [ ] AC-07.2: A collection view shows all flags — collected (full color) and not yet collected (silhouette)
- [ ] AC-07.3: Hovering or tapping a collected flag shows the country name and completion date

---

### F-08: XP & Progression

**Description:** Players earn XP for completing phases and lessons. XP is displayed and persisted.

**Acceptance Criteria:**

- [ ] AC-08.1: XP amounts per action are defined in the content pack
- [ ] AC-08.2: XP is displayed in the HUD during gameplay
- [ ] AC-08.3: XP is stored in localStorage and persists across sessions
- [ ] AC-08.4: Completing a lesson unlocks the next available map node(s) as defined in the content pack lesson graph

---

### F-09: Deployment

**Description:** The platform is deployed as a static site to GitHub Pages, served from a subpath.

**Acceptance Criteria:**

- [ ] AC-09.1: `npm run build` produces a static build deployable to GitHub Pages
- [ ] AC-09.2: The app functions correctly when served from a subpath (e.g. `/codequest-platform/`)
- [ ] AC-09.3: The site is accessible at `byram.dev/codequest-platform` (or configured subpath)
- [ ] AC-09.4: No server-side runtime is required

---

## 5. Out of Scope (Future Versions)

| Feature                             | Notes                                                        |
| ----------------------------------- | ------------------------------------------------------------ |
| Content authoring UI                | v2 — author creates/edits content packs via a web UI that exports JSON |
| Custom language / WASM compiler     | v3 — power user feature for content creators                 |
| Firebase auth + sync                | When multi-device or classroom features are needed           |
| Multiple simultaneous content packs | Platform already designed for it; enable in v2               |
| Leaderboards / social               | Post-v2                                                      |