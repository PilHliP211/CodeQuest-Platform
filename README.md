# CodeQuest Platform

Gamified coding education for kids 8–12. A content-driven React app where JSON packs define every lesson, map, and story beat.

## Commands

```
npm run dev          # Start dev server
npm run build        # Production build → dist/
npm run preview      # Serve production build locally
npm run typecheck    # TypeScript type check (tsc --noEmit)
npm run lint         # ESLint (--max-warnings=0)
npm run format:check # Prettier format check
```

## Development

```
npm install  # Install dependencies (also sets up Husky pre-commit hook)
```

All four gates must pass before merging: `lint`, `typecheck`, `format:check`, `build`.

## Documentation

See [`docs/`](docs/) for planning documents:

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — system design and tech stack
- [`docs/PRD.md`](docs/PRD.md) — product requirements
- [`docs/EPICS.md`](docs/EPICS.md) — epics and roadmap
- [`docs/CONTENT_SCHEMA.md`](docs/CONTENT_SCHEMA.md) — content pack JSON schema

## License

MIT — see [`LICENSE`](LICENSE).
