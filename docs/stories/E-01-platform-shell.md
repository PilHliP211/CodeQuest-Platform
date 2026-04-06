# E-01: Platform Shell & Dev Setup — Implementation Stories

**Epic:** E-01 Platform Shell & Dev Setup
**Priority:** P0 (Critical Path — everything depends on this)
**Goal:** A working React + Vite + TypeScript project with strict code standards enforced through deterministic, automated checks. Zero warnings tolerated from day one.

---

## Principles

- **Deterministic checks over conventions.** If a rule matters, it's enforced by a tool that fails the build. No "please remember to" rules.
- **Strict from the start.** Loosening rules later is easy; retrofitting strictness onto a messy codebase is painful.
- **Minimal viable tooling.** Only add tools that earn their keep. Each config file must justify its existence.

---

## S-01.1: Initialize Vite Project

**Type:** Setup
**Estimate:** XS

### What

Scaffold the project with `npm create vite@latest` using the `react-ts` template. Verify it runs.

### Tasks

1. Run `npm create vite@latest . -- --template react-ts` (in-place since repo exists)
2. Run `npm install`
3. Verify `npm run dev` starts the dev server and renders the default Vite page
4. Remove boilerplate content from `App.tsx` (replace with a minimal "CodeQuest" heading)
5. Remove `App.css`, `index.css` boilerplate styles (will be replaced by Tailwind in S-01.4)

### Done When

- [ ] `npm run dev` starts without errors
- [ ] `npm run build` produces `dist/` with a working static build
- [ ] `App.tsx` renders a minimal placeholder (no Vite boilerplate)
- [ ] No unused boilerplate files remain

---

## S-01.2: Strict TypeScript Configuration

**Type:** Setup
**Estimate:** XS

### What

Configure `tsconfig.json` for maximum type safety. TypeScript errors are build failures — not warnings, not suggestions.

### Tasks

1. Set `tsconfig.json` compiler options:
   ```jsonc
   {
     "compilerOptions": {
       "strict": true,                    // Enables all strict checks
       "noUncheckedIndexedAccess": true,   // array[i] returns T | undefined
       "noImplicitReturns": true,          // Every code path must return
       "noFallthroughCasesInSwitch": true, // switch cases must break/return
       "noUnusedLocals": true,             // Dead code = error
       "noUnusedParameters": true,         // Unused params = error
       "exactOptionalPropertyTypes": true, // Distinguishes undefined from missing
       "forceConsistentCasingInFileNames": true,
       "isolatedModules": true,            // Required by Vite
       "moduleResolution": "bundler",
       "jsx": "react-jsx",
       "target": "ES2022",
       "lib": ["ES2022", "DOM", "DOM.Iterable"],
       "baseUrl": ".",
       "paths": {
         "@/*": ["src/*"],
         "@content/*": ["content/*"]
       }
     },
     "include": ["src", "content"],
     "exclude": ["node_modules", "dist"]
   }
   ```
2. Configure `tsconfig.node.json` for Vite config files
3. Verify `npx tsc --noEmit` passes with zero errors

### Done When

- [ ] `npx tsc --noEmit` passes cleanly
- [ ] All `strict` family options are enabled
- [ ] Path aliases `@/*` and `@content/*` resolve correctly in imports
- [ ] Vite dev server still works after config changes

### Notes

- `noUncheckedIndexedAccess` is intentionally strict — it forces handling of `undefined` on every array/object index access. This prevents an entire class of runtime errors.
- `exactOptionalPropertyTypes` means `{ name?: string }` does NOT accept `{ name: undefined }`. This catches real bugs.

---

## S-01.3: ESLint Configuration (Strict)

**Type:** Setup
**Estimate:** S

### What

Configure ESLint with strict, opinionated rules. The goal is a linter that catches bugs and enforces consistency — not a linter that annoys developers into disabling rules.

### Tasks

1. Install dependencies:
   ```
   npm install -D eslint @eslint/js typescript-eslint eslint-plugin-react-hooks eslint-plugin-react-refresh
   ```
2. Create `eslint.config.js` (flat config format — ESLint v9+):
   ```js
   import js from '@eslint/js';
   import tseslint from 'typescript-eslint';
   import reactHooks from 'eslint-plugin-react-hooks';
   import reactRefresh from 'eslint-plugin-react-refresh';

   export default tseslint.config(
     { ignores: ['dist/', 'node_modules/'] },
     js.configs.recommended,
     ...tseslint.configs.strictTypeChecked,
     ...tseslint.configs.stylisticTypeChecked,
     {
       languageOptions: {
         parserOptions: {
           projectService: true,
           tsconfigRootDir: import.meta.dirname,
         },
       },
     },
     {
       plugins: {
         'react-hooks': reactHooks,
         'react-refresh': reactRefresh,
       },
       rules: {
         // React
         ...reactHooks.configs.recommended.rules,
         'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

         // TypeScript strict overrides
         '@typescript-eslint/no-unused-vars': ['error', {
           argsIgnorePattern: '^_',
           varsIgnorePattern: '^_',
         }],
         '@typescript-eslint/explicit-function-return-type': ['error', {
           allowExpressions: true,
           allowTypedFunctionExpressions: true,
         }],
         '@typescript-eslint/no-floating-promises': 'error',
         '@typescript-eslint/no-misused-promises': 'error',
         '@typescript-eslint/strict-boolean-expressions': 'error',
         '@typescript-eslint/switch-exhaustiveness-check': 'error',

         // General quality
         'no-console': ['error', { allow: ['warn', 'error'] }],
         'eqeqeq': ['error', 'always'],
         'no-var': 'error',
         'prefer-const': 'error',
         'curly': ['error', 'all'],
       },
     },
   );
   ```
3. Add `"lint": "eslint src/"` to `package.json` scripts
4. Add `"lint:fix": "eslint src/ --fix"` to `package.json` scripts
5. Verify `npm run lint` passes on the minimal codebase

### Done When

- [ ] `npm run lint` exits 0 on a clean codebase
- [ ] Type-checked rules are active (`strictTypeChecked`)
- [ ] `no-console` prevents accidental `console.log` commits
- [ ] `strict-boolean-expressions` prevents truthy/falsy coercion bugs
- [ ] `switch-exhaustiveness-check` enforces exhaustive switch on union types
- [ ] Unused variables are errors (with `_` prefix escape hatch)

### Key Rule Rationale

| Rule | Why |
|------|-----|
| `strictTypeChecked` | Catches type errors that `strict` alone misses (unsafe any, unsafe assignment) |
| `explicit-function-return-type` | Makes function contracts visible; catches accidental return type widening |
| `strict-boolean-expressions` | Prevents `if (str)` when you meant `if (str.length > 0)` — huge for kids' code handling |
| `switch-exhaustiveness-check` | When you add a new phase to the union type, the compiler tells you every switch that needs updating |
| `no-floating-promises` | Unhandled promise rejections are silent bugs |
| `eqeqeq` | `==` is a bug factory; `===` only |
| `curly: all` | No braceless `if` statements — prevents dangling-else bugs |

---

## S-01.4: Prettier Configuration

**Type:** Setup
**Estimate:** XS

### What

Configure Prettier for deterministic formatting. Zero debates about style — the formatter decides.

### Tasks

1. Install: `npm install -D prettier eslint-config-prettier`
2. Create `.prettierrc`:
   ```json
   {
     "semi": true,
     "singleQuote": true,
     "trailingComma": "all",
     "printWidth": 100,
     "tabWidth": 2,
     "arrowParens": "always",
     "endOfLine": "lf"
   }
   ```
3. Create `.prettierignore`:
   ```
   dist/
   node_modules/
   *.md
   ```
4. Add eslint-config-prettier to the ESLint config (disables formatting rules that conflict)
5. Add scripts:
   - `"format": "prettier --write \"src/**/*.{ts,tsx,json,css}\""`
   - `"format:check": "prettier --check \"src/**/*.{ts,tsx,json,css}\""`
6. Run `npm run format` on the codebase
7. Verify `npm run format:check` exits 0

### Done When

- [ ] `npm run format:check` exits 0
- [ ] ESLint and Prettier do not conflict (eslint-config-prettier is applied)
- [ ] All source files use consistent formatting

---

## S-01.5: Tailwind CSS + Pixel-Art Font

**Type:** Setup
**Estimate:** S

### What

Install and configure Tailwind CSS. Add the Press Start 2P pixel-art font. Establish the visual foundation.

### Tasks

1. Install: `npm install -D tailwindcss @tailwindcss/vite`
2. Add the Tailwind Vite plugin to `vite.config.ts`
3. Create `src/index.css` with Tailwind directives:
   ```css
   @import 'tailwindcss';
   ```
4. Add Press Start 2P font via Google Fonts `<link>` in `index.html`
5. Configure Tailwind theme extension for the pixel font:
   ```css
   @theme {
     --font-pixel: 'Press Start 2P', cursive;
   }
   ```
6. Add global CSS for pixel-art rendering:
   ```css
   img, canvas {
     image-rendering: pixelated;
   }
   ```
7. Verify Tailwind utility classes work in `App.tsx` (e.g., `className="font-pixel text-lg"`)

### Done When

- [ ] Tailwind utility classes apply correctly
- [ ] `font-pixel` class renders Press Start 2P font
- [ ] `image-rendering: pixelated` is global
- [ ] No unused CSS in production build (Tailwind purges automatically)

---

## S-01.6: Folder Structure

**Type:** Setup
**Estimate:** XS

### What

Create the directory structure from ARCHITECTURE.md. Each directory gets a barrel `index.ts` only when it has exports — no premature barrels.

### Tasks

1. Create directories:
   ```
   src/
   ├── engine/
   │   └── interpreter/
   ├── components/
   │   ├── Profile/
   │   ├── Map/
   │   ├── HUD/
   │   ├── Narrative/
   │   └── Collection/
   ├── editor/
   ├── renderer/
   └── types/
   ```
2. Add a `.gitkeep` in each empty directory so git tracks them
3. Create `src/types/content.ts` as an empty file with a `// Content pack types — defined in S-03.x` comment placeholder

### Done When

- [ ] Folder structure matches ARCHITECTURE.md
- [ ] All directories are tracked by git
- [ ] No barrel files yet (they'll be added when real exports exist)

---

## S-01.7: Vite Configuration for GitHub Pages

**Type:** Setup
**Estimate:** XS

### What

Configure Vite's `base` path so the build works when served from `/codequest-platform/`.

### Tasks

1. Update `vite.config.ts`:
   ```ts
   import { defineConfig } from 'vite';
   import react from '@vitejs/plugin-react';
   import tailwindcss from '@tailwindcss/vite';

   export default defineConfig({
     plugins: [react(), tailwindcss()],
     base: '/codequest-platform/',
     resolve: {
       alias: {
         '@': '/src',
         '@content': '/content',
       },
     },
   });
   ```
2. Verify `npm run build` produces assets with correct `/codequest-platform/` prefix in paths
3. Verify `npm run preview` serves the built app correctly

### Done When

- [ ] Built `index.html` references assets at `/codequest-platform/assets/...`
- [ ] `npm run preview` loads the app without 404s
- [ ] Path aliases `@/` and `@content/` resolve in imports

---

## S-01.8: GitHub Actions CI Workflow

**Type:** Setup
**Estimate:** S

### What

A CI workflow that runs on every PR and push to `main`. It runs lint, type-check, format-check, and build. If any step fails, the PR is blocked.

### Tasks

1. Create `.github/workflows/ci.yml`:
   ```yaml
   name: CI
   on:
     push:
       branches: [main]
     pull_request:
       branches: [main]

   jobs:
     check:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: npm
         - run: npm ci
         - run: npm run lint
         - run: npx tsc --noEmit
         - run: npm run format:check
         - run: npm run build
   ```
2. Verify the workflow YAML is valid
3. Ensure all four check commands exist in `package.json` scripts

### Done When

- [ ] `.github/workflows/ci.yml` exists and is valid YAML
- [ ] Workflow runs: `lint`, `tsc --noEmit`, `format:check`, `build` — in that order
- [ ] Any failure blocks the PR (default GitHub Actions behavior)

### Notes

The CI pipeline is the single source of truth for "is this code shippable?" Every check in CI must also be runnable locally via `npm run`. No CI-only magic.

---

## S-01.9: Project Metadata Files

**Type:** Setup
**Estimate:** XS

### What

Add `.gitignore`, `LICENSE`, and update `README.md`.

### Tasks

1. Create `.gitignore`:
   ```
   node_modules/
   dist/
   *.local
   .env
   .env.*
   .DS_Store
   ```
2. Add `LICENSE` (MIT)
3. Update root `README.md` with:
   - Project name and one-line description
   - `npm run dev` / `npm run build` / `npm run lint` commands
   - Link to `docs/` for planning documents
   - No badges, no lengthy prose — just enough to get started

### Done When

- [ ] `.gitignore` prevents `node_modules/` and `dist/` from being committed
- [ ] `LICENSE` file exists
- [ ] `README.md` has setup instructions that work on a fresh clone

---

## S-01.10: Pre-commit Quality Gate (Husky + lint-staged)

**Type:** Setup
**Estimate:** XS

### What

Run lint and format checks on staged files before every commit. Catches issues before they reach CI.

### Tasks

1. Install: `npm install -D husky lint-staged`
2. Run `npx husky init`
3. Configure `.husky/pre-commit`:
   ```sh
   npx lint-staged
   ```
4. Add `lint-staged` config to `package.json`:
   ```json
   {
     "lint-staged": {
       "src/**/*.{ts,tsx}": ["eslint --max-warnings=0", "prettier --check"],
       "src/**/*.{json,css}": ["prettier --check"]
     }
   }
   ```
5. Verify: stage a file with a lint error, attempt commit, confirm it's rejected

### Done When

- [ ] Committing a file with lint errors fails
- [ ] Committing a file with formatting issues fails
- [ ] Clean files commit without issues
- [ ] `--max-warnings=0` means warnings are treated as errors

### Notes

This is the last line of defense before CI. It runs only on staged files (fast) and prevents "oops, forgot to lint" commits. The `--max-warnings=0` flag is critical — it means ESLint warnings are commit-blocking, not just noise.

---

## Story Dependency Graph

```
S-01.1 (Vite init)
  ├── S-01.2 (TypeScript strict)
  ├── S-01.5 (Tailwind + font)
  ├── S-01.7 (Vite base path)
  └── S-01.9 (Metadata files)

S-01.2 (TypeScript strict)
  └── S-01.3 (ESLint) ← needs tsconfig for type-checked rules
        └── S-01.4 (Prettier) ← needs ESLint to add compat config
              └── S-01.10 (Pre-commit) ← needs lint + format scripts

S-01.6 (Folder structure) ← can happen any time after S-01.1
S-01.8 (CI) ← needs all scripts to exist (after S-01.3, S-01.4)
```

## Suggested Implementation Order

1. **S-01.1** → **S-01.9** → **S-01.2** (foundation)
2. **S-01.3** → **S-01.4** → **S-01.10** (code standards pipeline)
3. **S-01.5** → **S-01.6** → **S-01.7** (UI foundation + structure)
4. **S-01.8** (CI — last, once all scripts exist)
