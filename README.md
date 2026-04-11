# CodeQuest Platform

Gamified coding education for kids 8–12. A content-driven React app where JSON packs define every lesson, map, and story beat.

## Commands

```
npm run dev          # Start dev server
npm run build        # Production build → dist/
npm run preview      # Serve production build locally
npm run typecheck    # TypeScript type check (tsc --noEmit)
npm run lint         # ESLint (--max-warnings=0)
npm run test         # Vitest (unit + component + invariant)
npm run test:e2e     # Playwright (critical journeys only)
npm run format:check # Prettier format check
```

## Development

```
npm install  # Install dependencies (also sets up Husky pre-commit hook)
```

All gates must pass before merging: `lint`, `typecheck`, `test`, `format:check`, `build`. `test:e2e` runs in CI on every PR.

## Contributing

Coding standards, patterns, and the testing strategy live in [`.claude/skills/`](.claude/skills/). Start with [`.claude/skills/README.md`](.claude/skills/README.md) for the index, and [`.claude/skills/testing-strategy.md`](.claude/skills/testing-strategy.md) for how validation works in this repo.

## Documentation

See [`docs/`](docs/) for planning documents:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design and tech stack
- [`docs/PRD.md`](docs/PRD.md) — product requirements
- [`docs/EPICS.md`](docs/EPICS.md) — epics list
- [`docs/ROADMAP.md`](docs/ROADMAP.md) — sequencing and milestones
- [`docs/CONTENT_SCHEMA.md`](docs/CONTENT_SCHEMA.md) — content pack JSON schema
- [`docs/stories/`](docs/stories/) — implementation tickets per epic

## License

MIT — see [`LICENSE`](LICENSE).
