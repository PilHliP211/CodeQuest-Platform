# E-01: Platform Shell & Dev Setup

**Priority:** P0 — everything depends on this.
**Goal:** A working React + Vite + TypeScript project with strict code standards enforced through deterministic, automated checks. Zero warnings tolerated from day one.

## Principles

- **Deterministic checks over conventions.** If a rule matters, it's enforced by a tool that fails the build.
- **Strict from the start.** Loosening rules later is easy; retrofitting strictness is painful.
- **Minimal viable tooling.** Each config file must justify its existence.

## Stories

| # | Story | Size |
|---|-------|------|
| S-01.01 | Vite + React + TypeScript scaffold | XS |
| S-01.02 | Strict tsconfig.json | XS |
| S-01.03 | .gitignore | XS |
| S-01.04 | LICENSE and README | XS |
| S-01.05 | Folder structure | XS |
| S-01.06 | Path aliases (@/ and @content/) | XS |
| S-01.07 | Install ESLint | XS |
| S-01.08 | ESLint base + strictTypeChecked rules | S |
| S-01.09 | ESLint project-specific rule overrides | S |
| S-01.10 | Install Prettier | XS |
| S-01.11 | ESLint–Prettier compatibility | XS |
| S-01.12 | Install Tailwind CSS | XS |
| S-01.13 | Press Start 2P pixel font | XS |
| S-01.14 | Pixel-rendering global CSS | XS |
| S-01.15 | Vite base path for GitHub Pages | XS |
| S-01.16 | Install Husky | XS |
| S-01.17 | Configure lint-staged | XS |
| S-01.18 | GitHub Actions CI workflow | S |
| S-01.19 | End-to-end gate verification | XS |

## Dependency Order

Roughly top-to-bottom. The full dependency graph:

```
S-01.01 (scaffold)
  ├── S-01.02 (tsconfig) ──────┐
  ├── S-01.03 (.gitignore)     │
  ├── S-01.04 (LICENSE/README) │
  ├── S-01.05 (folders)        │
  ├── S-01.06 (path aliases) ──┤
  └── S-01.15 (Vite base path) │
                               │
S-01.07 (install ESLint) ←─────┤
  └── S-01.08 (base rules) ←───┘
        └── S-01.09 (project rules)

S-01.10 (install Prettier)
  └── S-01.11 (ESLint–Prettier compat) ← needs S-01.09

S-01.12 (Tailwind)
  ├── S-01.13 (font)
  └── S-01.14 (pixel rendering)

S-01.16 (Husky)
  └── S-01.17 (lint-staged) ← needs S-01.09 + S-01.11

S-01.18 (CI) ← needs all scripts to exist
S-01.19 (end-to-end verification) ← last
```
