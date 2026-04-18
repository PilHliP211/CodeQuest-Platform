# BUG-001: Monaco TypeScript Worker 404s Under the Vite Base Path

**Epic:** Bug
**Size:** S
**Dependencies:** None

## Skills to Load

- `testing-strategy` — **required** — verify the learner-visible syntax editor and browser error outcome
- `react-component-structure` — keep worker setup isolated from editor UI behavior
- `typescript-standards` — type Monaco worker configuration without `any`
- `ci-and-quality-gates` — verify both dev server and production build/preview paths

## What

Opening the syntax editor harness loads Monaco and the editor is usable, but the browser requests:

```text
/codequest-platform/node_modules/.vite/deps/ts.worker.js?worker_file&type=module
```

That request returns 404 in dev, and Vite reports that the file does not exist in the optimized deps directory. The page also emits a generic `pageerror: Event` alongside the failed worker request.

This is not an intentional deferred content-pack feature. It is platform/editor infrastructure and should be fixed before relying on the syntax editor for the full lesson path.

## Reproduction

1. Run `npm run dev`.
2. Open `/codequest-platform/__dev/syntax-editor`.
3. Click `Unlock Phase 3 Editor`.
4. Watch Network/Console.
5. Monaco requests `ts.worker.js` from the wrong optimized dependency URL and logs an error.

## Tasks

1. Spike the smallest Vite-compatible fix first.
   - The dev-server warning suggests adding the relevant Monaco packages to `optimizeDeps.exclude`; try that before adding custom worker plumbing.
   - If Vite config alone does not remove the 404/page error, configure Monaco workers explicitly with Vite-supported worker imports such as `monaco-editor/esm/vs/editor/editor.worker?worker` and `monaco-editor/esm/vs/language/typescript/ts.worker?worker`.
   - If explicit worker setup is needed, provide a typed `MonacoEnvironment.getWorker` setup before Monaco mounts.
   - Keep any worker setup in a small module imported by `SyntaxEditor.tsx` or by the syntax-editor entry point.

2. Preserve the restricted editor behavior from E-08.
   - Custom completions still come only from `availableFunctions`.
   - Built-in DOM/global autocomplete remains suppressed.
   - Syntax diagnostics still work where intentionally enabled.

3. Verify base-path compatibility.
   - The worker URLs must work under `/codequest-platform/`.
   - Do not hardcode the deployed origin or localhost port.

4. Add automated coverage or a dev smoke test that catches worker 404s.
   - Prefer a Playwright check for the syntax editor route that fails on app-origin 404s and page errors.
   - If Playwright is not yet committed for this repo, add the smallest appropriate test harness or document the manual browser check in the bug PR.

## Done When

- [ ] The chosen fix is the smallest change that removes the worker 404 in dev and still works in build/preview
- [ ] `/__dev/syntax-editor` opens under `/codequest-platform/` without worker 404s
- [ ] Browser console has no Monaco worker errors after unlocking the editor
- [ ] The syntax editor still renders and accepts code edits
- [ ] Completion suggestions remain restricted to content-provided `availableFunctions`
- [ ] Production build still emits the needed Monaco worker assets
- [ ] Local preview or equivalent base-path check confirms workers load under `/codequest-platform/`
- [ ] `npm run lint`, `npx tsc --noEmit`, `npm run test`, and `npm run build` pass
