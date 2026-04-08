---
name: localstorage-pattern
description: How to read, write, and validate localStorage data. Load when adding any persistent state.
---

# localStorage Pattern

All localStorage access in this project goes through `src/engine/storage.ts`. Never call `localStorage.getItem` directly from a component or domain module.

## Why

localStorage is an external boundary. Stored data may be:
- Missing (first launch)
- Corrupt (manual edit, version skew, browser quirks)
- Wrong shape (older app version)

TypeScript types do not exist at runtime. The wrapper validates at the boundary.

## The Wrapper (`storage.ts`)

```ts
export function readStorage<T>(
  key: string,
  validate: (data: unknown) => data is T,
): T | null {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    const parsed: unknown = JSON.parse(raw);
    return validate(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

export function removeStorage(key: string): void {
  localStorage.removeItem(key);
}
```

## Per-Domain Stores

Each domain has its own thin store that uses the wrapper:

```ts
// src/engine/profileStore.ts
import { readStorage, writeStorage } from './storage';
import type { LearnerProfile } from '@/types/profile';

const PROFILE_KEY = 'codequest:profile';

function isLearnerProfile(data: unknown): data is LearnerProfile {
  return (
    typeof data === 'object' &&
    data !== null &&
    'name' in data &&
    typeof (data as { name: unknown }).name === 'string' &&
    (data as { name: string }).name.length > 0
  );
}

export function loadProfile(): LearnerProfile | null {
  return readStorage(PROFILE_KEY, isLearnerProfile);
}

export function saveProfile(profile: LearnerProfile): void {
  writeStorage(PROFILE_KEY, profile);
}
```

## Key Naming

All keys use the `codequest:` prefix:

```
codequest:profile
codequest:progress:{packId}:{lessonId}
codequest:settings
```

## Rules

- **Never call `localStorage.*` directly outside of `storage.ts`.**
- **Always provide a type guard** to `readStorage`. No `as` casts.
- **Corrupt data returns `null`**, never throws. Treat as "first launch" state.
- **Wrap writes in nothing fancy.** localStorage is synchronous. If it fails (quota, private mode), let it throw — surface the error in the UI.
- **No migrations in v1.** If the schema changes, bump the key (`codequest:profile:v2`) and treat old data as missing.
