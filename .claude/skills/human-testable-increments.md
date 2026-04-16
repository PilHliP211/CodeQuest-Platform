---
name: human-testable-increments
description: How to plan and finish each CodeQuest epic as a human-testable, npm-run-dev-visible increment with matching automated coverage. Load when creating or updating epic plans, adding an epic checkpoint story, or introducing a temporary dev harness/route.
---

# Human-Testable Increments

Every epic must leave the app observably different when a developer runs `npm run dev`.

An epic is not done if its value is only visible in source files, types, or future wiring. If the work is foundational, add the smallest reasonable dev-facing harness, route, panel, or in-product stub that lets a human exercise the new behavior.

## Epic Validation Contract

Each epic README must include:

- **Human Testable Increment**: exact `npm run dev` steps and the learner/developer-visible outcome.
- **Automated Validation**: the unit, component, invariant, or E2E tests that prove the same behavior at the right layer.
- **Temporary Surface Decision**: whether the test surface is a final product path or a temporary dev-only harness, and when it should be removed.

Each epic's final checkpoint story must load this skill and include Done When items for both the human check and automated coverage.

## Choosing The Human Surface

Prefer product UI when it exists: map screen, lesson screen, settings, collection, or deployed app.

Use a temporary dev harness only when the product path does not exist yet. Acceptable forms:

- A dev-only route such as `/__dev/interpreter` or `/__dev/canvas`.
- A small temporary panel inside the current screen.
- A story-specific fixture state seeded from test content.

Temporary surfaces must be clearly named as dev-only and must not contain lesson content that should live in `content/`. They may read the gold-standard Flag Hunter pack as a fixture, but production platform code must stay content-agnostic.

## Writing The Human Check

Use concrete steps:

1. Start `npm run dev`.
2. Navigate to the product screen or dev harness.
3. Perform one or two realistic actions.
4. Observe the visible result that proves the epic changed behavior.

Good: "Open `/__dev/canvas`, click Run Japan solution, watch the white background and red circle draw one step at a time, click Reset, and see the canvas clear."

Bad: "Verify renderer API exists."

## Writing The Automated Check

Use `testing-strategy` to choose the layer:

- Pure engine behavior: unit tests.
- React UI behavior: component tests.
- Security or schema boundaries: invariant tests.
- Full learner journey or deployment smoke: E2E tests.

Do not test the temporary harness unless the harness itself is product behavior. Test the engine/component behavior underneath it so the harness can be deleted without gutting coverage.

## Cleanup Rule

If a temporary harness is added, the same epic must state when it is removed or folded into product UI. Common cleanup points:

- E-11 replaces editor/renderer harnesses with `LessonScreen`.
- E-14 replaces subsystem demos with the full Japan lesson playthrough.
- E-15 replaces local-only checks with the deployed smoke test.
