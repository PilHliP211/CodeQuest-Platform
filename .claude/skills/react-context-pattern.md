---
name: react-context-pattern
description: The standard React Context pattern used throughout the project — provider, hook, and memoization. Load when creating or consuming a context.
---

# React Context Pattern

Every context in this project follows the same shape. The `ProfileContext` is the canonical example.

## The Pattern

```tsx
import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

// 1. Define the value type
interface FooContextValue {
  foo: Foo | null;
  setFoo: (foo: Foo) => void;
}

// 2. Create context with undefined default (forces provider usage)
const FooContext = createContext<FooContextValue | undefined>(undefined);

// 3. Provider component
export function FooProvider({ children }: { children: ReactNode }): React.ReactElement {
  const [foo, setFooState] = useState<Foo | null>(null);

  const setFoo = (next: Foo): void => {
    setFooState(next);
    // persist if needed
  };

  // 4. Memoize the value — without this, every render creates a new object
  //    and every consumer re-renders unnecessarily
  const value = useMemo<FooContextValue>(() => ({ foo, setFoo }), [foo]);

  return <FooContext.Provider value={value}>{children}</FooContext.Provider>;
}

// 5. Hook with provider check
export function useFoo(): FooContextValue {
  const ctx = useContext(FooContext);
  if (ctx === undefined) {
    throw new Error('useFoo must be used within <FooProvider>');
  }
  return ctx;
}
```

## Rules

- **`undefined` default, not `null`.** This makes "used outside provider" a distinct failure mode the hook can detect.
- **Always memoize the value.** Without `useMemo`, every parent render forces all consumers to re-render.
- **Always provide a hook.** Never export the raw `Context` for direct `useContext` access by consumers.
- **Hook throws on misuse.** Provider-less usage is a bug; fail loudly.
- **Provider does its own persistence.** Consumers don't know about localStorage. The provider reads on mount and writes on update.

## What to Avoid

- Multiple unrelated values in one context (causes spurious re-renders). Split into separate contexts.
- Storing computed values in context state. Compute them in `useMemo` or in consumers.
- Putting functions in context without `useCallback`/stable references — they cause cascading re-renders.
