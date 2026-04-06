# CodeQuest Platform

A gamified, story-driven coding education platform for kids. Players chase a globe-trotting villain across the world, solving coding challenges to restore what she's stolen — starting with the flags of every nation.

## What is CodeQuest?

CodeQuest is a **content-driven platform** where all stories, lessons, sprites, maps, and progression logic are defined in structured JSON content packs. The platform engine renders those packs into a fully playable, game-like learning experience.

The first content pack — **CodeQuest: Flag Hunter** — follows a mysterious villain who is erasing countries from history by stealing their flags. Players must chase her across the globe, writing code to travel the world map and reconstruct each nation's flag from scratch.

## Key Features

- **Gamified progression** — world map with unlockable nodes, XP, flag collection
- **3-phase lesson structure** — Navigate → Investigate → Restore
- **Dual-mode code editor** — Blockly visual blocks that reveal their syntax, with an unlockable syntax editor
- **Canvas renderer** — code-driven visual output (flags, maps, spaceships — configurable per content pack)
- **Plug-and-play content packs** — lessons are self-contained folders of JSON + assets
- **Configurable learner profile** — name, progress, and unlocks stored in localStorage
- **Embeddable** — designed to be hosted as a subpath on any static site (e.g. `byram.dev/codequest`)

## Tech Stack

| Layer            | Choice                                         |
| ---------------- | ---------------------------------------------- |
| Framework        | React + Vite + TypeScript                      |
| Block Editor     | Google Blockly                                 |
| Canvas Rendering | HTML5 Canvas API                               |
| Styling          | TBD (CSS Modules or Tailwind)                  |
| Persistence      | localStorage (v1), Firebase Firestore (future) |
| Deployment       | GitHub Pages                                   |
| Sprites          | OpenGameArt.org (CC-licensed)                  |

## Repository Structure

```
codequest-platform/
├── docs/                   Planning and reference documents
│   ├── PRD.md
│   ├── ARCHITECTURE.md
│   ├── CONTENT_SCHEMA.md
│   ├── EPICS.md
│   └── ROADMAP.md
├── src/                    Platform source code (added during development)
│   ├── engine/             Core platform: lesson runner, progression, storage
│   ├── components/         Shared UI components
│   ├── editor/             Block editor + syntax editor integration
│   ├── renderer/           Canvas renderer (configurable per content pack)
│   └── map/                World map component
└── content/                Content packs
    └── flag-hunter/        First content pack
        ├── course.json     Course metadata and lesson index
        └── lessons/
            └── 001-japan/  Lesson 1: Japan
```

## Documentation

- [PRD](docs/PRD.md) — Product requirements with acceptance criteria
- [Architecture](docs/ARCHITECTURE.md) — System design and tech decisions
- [Content Schema](docs/CONTENT_SCHEMA.md) — JSON structure for content packs
- [Epics](docs/EPICS.md) — High-level work epics
- [Roadmap](docs/ROADMAP.md) — Phased delivery plan

## Deployment

CodeQuest is deployed as a static site to GitHub Pages and served from a subpath of the author's personal domain. See [Architecture](docs/ARCHITECTURE.md) for deployment details.

No backend is required for v1. All learner progress is persisted in the browser via localStorage.
## Documentation

- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — stack decisions and site design
- [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) — GitHub Pages + custom domain setup
- [docs/CONTRIBUTING.md](docs/CONTRIBUTING.md) — adding posts and projects
- [docs/ROADMAP.md](docs/ROADMAP.md) — planned future features
- [docs/bugs/README.md](docs/bugs/README.md) — live-site audit plus actionable bug and refactor tickets

## Current audit backlog

The current live-site audit is tracked in [docs/bugs/README.md](docs/bugs/README.md).
That folder now contains individual ticket files for the main production issues and
the maintainability refactors identified during the audit.

## Proposed maintainability enhancements

These are the highest-value refactors currently queued:

- Consolidate the color/theme contract so semantic utilities and dark mode share one source of truth
- Extract shared blog content loading helpers instead of repeating `getCollection()` sorting logic
- Make projects data-driven instead of maintaining duplicate empty arrays in page files
- Make theme-toggle initialization idempotent so client handlers do not stack over time
- Move prose theming to a dedicated contract instead of relying on a fragile `.prose` override
- Centralize navigation and page-metadata defaults so route changes stay consistent