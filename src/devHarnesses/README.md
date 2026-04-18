# Dev Harnesses

Temporary `npm run dev` surfaces live here so they are easy to find and remove.

Rules:

- Put all future dev harness screens and harness-only loaders in `src/devHarnesses/`.
- Put harness-only content fixtures in `content/flag-hunter/dev-harnesses/`.
- Route temporary harnesses from `src/App.tsx` using `/__dev/...`.
- Keep production engine, editor, renderer, and lesson modules free of harness-specific content.
- Remove this directory and matching `/__dev/...` routes once `LessonScreen` exercises the same behavior.
