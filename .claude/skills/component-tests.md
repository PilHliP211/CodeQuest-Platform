---
name: component-tests
description: How to test React components for user-visible behavior using Vitest + React Testing Library. Load with `testing-strategy` whenever a story creates or modifies a component with observable behavior.
---

# Component Tests (Vitest + Testing Library)

Component tests verify that **a user interacting with the component sees the right thing and can do the right thing**. They do not verify which hooks ran, which state variables exist, or how many times render was called.

Pair this with `testing-strategy` (the rules) and `react-component-structure` (the code).

Component tests are allowed to render with the gold-standard Flag Hunter content pack as their context fixture — see `testing-strategy → Gold Standard Test Pack`. The component being tested never knows which pack it's looking at; the test does.

## Tooling

First component-test story in the project installs and configures:

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

`vitest.config.ts` (create if absent):

```ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    globals: false,
  },
});
```

`src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
```

## File Conventions

- Place the test next to the component: `NameEntryScreen.tsx` → `NameEntryScreen.test.tsx`.
- A component test file ONLY imports the component's public export and any providers it needs.

## The Rule: Query By What The User Sees

Prefer queries in this order — the first that works is the right one:

1. `getByRole(name)` — buttons, headings, form fields. This matches how screen readers and keyboard users find the element.
2. `getByLabelText(name)` — form inputs.
3. `getByText(text)` — static, user-visible copy.
4. `getByTestId(id)` — **last resort**, and only for elements with no accessible identity (decorative canvases, fixed sprites).

Never query by CSS class, tag name, or component display name. Those are implementation details.

## The Template

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { NameEntryScreen } from './NameEntryScreen';

describe('NameEntryScreen', () => {
  it('submits the learner name when the submit button is clicked', async () => {
    // Arrange
    const handleSubmit = vi.fn();
    render(<NameEntryScreen onSubmit={handleSubmit} />);
    const user = userEvent.setup();

    // Act
    await user.type(screen.getByLabelText(/your name/i), 'Hana');
    await user.click(screen.getByRole('button', { name: /start/i }));

    // Assert OUTCOME: the handler received the correct name
    expect(handleSubmit).toHaveBeenCalledWith('Hana');
  });

  it('shows a validation error when the name is empty', async () => {
    render(<NameEntryScreen onSubmit={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /start/i }));

    // Outcome: the learner sees a friendly error message
    expect(await screen.findByRole('alert')).toHaveTextContent(/enter a name/i);
  });
});
```

Note that the **only spy** is at the component boundary (the `onSubmit` callback, which is the observable output). Everything else is queried through the rendered DOM.

## What To Test, What Not To Test

Test:
- **What renders** given a set of props (presence of headings, buttons, collectible tiles, dialogue text).
- **Primary user interactions** (click, type, keyboard nav where it matters).
- **Accessibility affordances** (label on input, role on button, `aria-live` on dialogue box).
- **Visual state changes from user action** (error appears, button becomes disabled, toggle flips).
- **Callback contracts** (the component calls `onSubmit(name)` with the right value).
- **Empty, loading, and error states** if the component has them.

Do NOT test:
- Hook implementation details (don't spy on `useState` or `useEffect`).
- CSS classes, colors, exact pixel positions (unless the story specifically calls that out).
- Library internals (Blockly's renderer, Monaco's DOM, Canvas pixel data).
- Every possible prop combination — pick the ones a learner would actually hit.
- Snapshot-based "output doesn't change" tests. Forbidden.

## Providers and Contexts

When a component depends on a context (`ProfileProvider`, `ContentProvider`, etc.), wrap it in a **test helper**:

```tsx
// src/test/renderWithProviders.tsx
import { render } from '@testing-library/react';
import type { ReactElement } from 'react';
import { ProfileProvider } from '@/engine/profile/ProfileContext';
import { ContentProvider } from '@/engine/content/ContentContext';
import { testCourse } from './fixtures/testCourse';

export function renderWithProviders(
  ui: ReactElement,
  opts: { profile?: { name: string }; course?: Course } = {},
) {
  return render(
    <ContentProvider initialCourse={opts.course ?? testCourse}>
      <ProfileProvider initialProfile={opts.profile ?? null}>
        {ui}
      </ProfileProvider>
    </ContentProvider>,
  );
}
```

Tests use `renderWithProviders(<ComponentUnderTest />, { profile: { name: 'Hana' } })`. They do **not** mock `useProfile` or reach into the context directly.

## Async UI

- Use `findBy*` (auto-waiting) for content that appears asynchronously.
- Never use `waitFor(() => expect(...))` when a `findBy*` query will do.
- Never `await new Promise(r => setTimeout(r, ...))`. Use `vi.useFakeTimers` with `await user.advanceTimers()` if needed.

## Canvas, Blockly, Monaco

These libraries render into DOM in ways Testing Library cannot meaningfully introspect. Test strategy:

- **Blockly editor**: test the wrapper's contract — it receives a `lessonId`, it calls `onRun(code)` when the run button is clicked, it renders blocks matching `availableBlocks`. Do NOT verify the rendered SVG.
- **Monaco editor**: test the toggle visibility, the unlocked state, and the `onRun(code)` contract. Do NOT type into Monaco.
- **Canvas**: test that the component renders a `<canvas>` with the correct `width`/`height`. For drawing correctness, write a unit test on the renderer API with a fake drawing backend — pixel assertions live there, not in the component test.
- **Full integration** of these libraries is verified by the E2E test (see `e2e-tests`).

## Accessibility Checks

Every component test should include at least one query that would fail if the accessibility affordance regressed. For form components, that's `getByLabelText`. For interactive components, `getByRole('button', { name })`. This gives you accessibility coverage as a free side effect.

## Anti-Patterns

- `render(<X />); expect(container.firstChild).toMatchSnapshot();` — forbidden.
- `expect(wrapper.state().count).toBe(1)` — tests mechanics; use Enzyme-style APIs anywhere.
- `fireEvent.change(input, { target: { value: 'x' } })` when `userEvent.type` would do.
- Mocking a child component to "isolate" the parent. If the child is complex, test them together — that's the outcome.
- Asserting on specific element positions in a list: `screen.getAllByRole('listitem')[2]`. Assert on identity instead (`getByRole('listitem', { name: /japan/i })`).

## The Gate

```
npm run test
npx tsc --noEmit
npm run lint
```

Test files follow all lint rules — no `any`, no `console.log`, no disabled rules.
