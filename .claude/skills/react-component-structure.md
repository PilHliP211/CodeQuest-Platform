---
name: react-component-structure
description: How React components are structured in this project — file layout, prop types, hook order. Load when creating or modifying React components.
---

# React Component Structure

## File Template

```tsx
// 1. External imports
import { useState } from 'react';

// 2. Internal imports (use @/ alias)
import { useProfile } from '@/engine/ProfileContext';

// 3. Type-only imports
import type { LearnerProfile } from '@/types/profile';

// 4. Props interface (co-located, NOT in a separate file)
interface NameEntryScreenProps {
  onSubmit: (name: string) => void;
}

// 5. Component (named export, explicit return type)
export function NameEntryScreen({ onSubmit }: NameEntryScreenProps): React.ReactElement {
  // hooks first
  const [name, setName] = useState('');

  // derived state
  const isValid = name.trim().length > 0 && name.trim().length <= 20;

  // handlers
  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault();
    if (isValid) onSubmit(name.trim());
  };

  // render
  return (
    <form onSubmit={handleSubmit}>
      {/* ... */}
    </form>
  );
}
```

## Rules

- **One component per file.** Filename matches component name.
- **Named exports only.** No default exports — they break refactoring tools and `react-refresh`.
- **Props interface co-located.** Same file as the component, defined above the function.
- **Explicit return type.** `React.ReactElement` for components that always render. `React.ReactElement | null` if they may render nothing.
- **Hook order:** state hooks → context hooks → effect hooks → custom hooks. Group related hooks together.
- **No inline function components.** Don't define a sub-component inside another component's body — it remounts on every render.

## Props Patterns

```tsx
// Required props
interface Props {
  name: string;
  onSubmit: (value: string) => void;
}

// Optional props — use ? not | undefined (matches exactOptionalPropertyTypes)
interface Props {
  placeholder?: string;
}

// Children
interface Props {
  children: React.ReactNode;
}
```

## What to Avoid

- Default exports
- `React.FC` / `React.FunctionComponent` (implicit children, harder return-type narrowing)
- Anonymous components (`export default () => ...`)
- Sub-components defined inside parent components
- Spreading `...rest` props onto DOM elements without typing them
