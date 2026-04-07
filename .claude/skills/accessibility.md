---
name: accessibility
description: Accessibility minimums for forms, navigation, and interactive components. Load when building any UI.
---

# Accessibility

Kids use screen readers and keyboards too. Accessibility is not optional, but the bar for v1 is "the basics done right" — not WCAG AAA.

## Forms

- Every input has a `<label>` (use `htmlFor` linking by `id`).
- Use `<form>` with `onSubmit`, not a click handler on the button. The browser handles Enter-to-submit for free.
- Validation errors use `aria-describedby` linking to the message element.
- The submit button has clear text — never icon-only.
- Disabled buttons say *why* they're disabled (visually or via `aria-describedby`).

```tsx
<form onSubmit={handleSubmit}>
  <label htmlFor="name-input">Your name</label>
  <input
    id="name-input"
    aria-describedby={error ? 'name-error' : undefined}
    aria-invalid={error !== null}
  />
  {error !== null && <p id="name-error">{error}</p>}
  <button type="submit" disabled={!isValid}>Start Quest!</button>
</form>
```

## Keyboard

- All interactive elements reachable by Tab.
- All actions doable without a mouse.
- Focus visible (don't kill the default focus ring without replacing it).
- Auto-focus the primary input on screens that have one (name entry, code editor).
- Esc closes modals and overlays.

## Semantic HTML

- `<button>` for buttons. Not `<div onClick>`.
- `<a href>` for navigation. Not `<button>` that calls `navigate()`.
- Headings in order (`h1` → `h2` → `h3`). Don't skip levels.
- Lists are `<ul>` / `<ol>`, not `<div>` soup.

## Don't Bother (in v1)

- Full ARIA widget patterns (combobox, tree, etc.) — stick to native elements
- Screen reader testing on every PR — it's enough to use semantic HTML and labels
- Color contrast audits — pixel-art aesthetic uses bold colors; we'll audit before launch
