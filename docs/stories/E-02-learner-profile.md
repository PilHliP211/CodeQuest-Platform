# E-02: Learner Profile — Implementation Stories

**Epic:** E-02 Learner Profile
**Priority:** P0
**Dependencies:** E-01 (Platform Shell)
**Goal:** Kids can enter a name, see it in the UI, and change it later. The name persists across sessions. Simple feature, but it establishes patterns for localStorage persistence, React context, form handling, and component structure that later epics will follow.

---

## Principles

- **One pattern, used everywhere.** The localStorage wrapper and React context patterns established here become the template for E-12 (Progression & Persistence).
- **Type the boundary.** The localStorage schema is typed with runtime validation. If the stored JSON doesn't match the type, we handle it gracefully — not with a crash.
- **Accessible by default.** Form inputs have labels, focus management works, keyboard navigation works. Kids use screen readers too.

---

## S-02.1: LearnerProfile Type & localStorage Wrapper

**Type:** Implementation
**Estimate:** S
**Dependencies:** S-01.2 (TypeScript strict)

### What

Define the `LearnerProfile` type and a thin, typed wrapper around localStorage for reading/writing it. This wrapper becomes the pattern for all future localStorage operations.

### Tasks

1. Create `src/types/profile.ts`:
   ```ts
   export interface LearnerProfile {
     name: string;
     createdAt: string; // ISO 8601
   }
   ```
2. Create `src/engine/storage.ts` — a generic typed localStorage wrapper:
   ```ts
   // Key: string literal type for type safety
   // Value: parsed and validated at read time

   export function readStorage<T>(key: string, validate: (data: unknown) => T | null): T | null;
   export function writeStorage<T>(key: string, value: T): void;
   export function removeStorage(key: string): void;
   ```
3. Create `src/engine/profileStore.ts` — profile-specific operations using the wrapper:
   ```ts
   const PROFILE_KEY = 'codequest:profile';

   export function loadProfile(): LearnerProfile | null;
   export function saveProfile(profile: LearnerProfile): void;
   export function isProfileValid(data: unknown): data is LearnerProfile;
   ```
4. The `isProfileValid` function must check:
   - `data` is a non-null object
   - `data.name` is a string with length > 0
   - `data.createdAt` is a valid ISO 8601 string
5. If stored data fails validation, `loadProfile` returns `null` (treat as first launch — don't crash)

### Done When

- [ ] `LearnerProfile` type is exported from `src/types/profile.ts`
- [ ] `storage.ts` reads, writes, and removes localStorage keys with JSON parse/stringify
- [ ] `profileStore.ts` validates stored data at read time
- [ ] Corrupt localStorage data returns `null`, not a thrown error
- [ ] All functions pass `npm run lint` with strict type checking
- [ ] No `any` types — `unknown` used at the parse boundary with narrowing

### Implementation Notes

**Why a generic `storage.ts` wrapper?** E-12 (Progression) will need the exact same read/write/validate pattern for `codequest:progress:*` keys. Build the pattern once here.

**Why runtime validation?** localStorage is an external boundary. A user (or a bug, or a different version) can put anything in there. TypeScript types don't exist at runtime — we must validate.

---

## S-02.2: Profile React Context

**Type:** Implementation
**Estimate:** S
**Dependencies:** S-02.1

### What

A React context that provides the current profile (or `null` if none exists) and functions to create/update it. This context sits near the root of the app and gates content behind profile creation.

### Tasks

1. Create `src/engine/ProfileContext.tsx`:
   ```ts
   interface ProfileContextValue {
     profile: LearnerProfile | null;
     isLoading: boolean;
     createProfile: (name: string) => void;
     updateName: (name: string) => void;
   }
   ```
2. The provider:
   - Reads from `profileStore.loadProfile()` on mount
   - Exposes `isLoading` while the initial read happens (even though localStorage is sync, keep the pattern for future async upgrade to Firebase)
   - `createProfile` writes to localStorage and updates state
   - `updateName` writes to localStorage and updates state (preserves `createdAt`)
3. Create a `useProfile` hook that reads from context with a helpful error if used outside the provider
4. Wrap the app root (`App.tsx`) with `<ProfileProvider>`

### Done When

- [ ] `useProfile()` returns the current profile state from any component
- [ ] `createProfile("Ada")` persists and immediately reflects in UI
- [ ] `updateName("Grace")` persists and immediately reflects in UI
- [ ] Using `useProfile()` outside of `<ProfileProvider>` throws a clear error
- [ ] Context value is stable (no unnecessary re-renders) — use `useMemo` on the value

---

## S-02.3: Name Entry Screen

**Type:** Implementation
**Estimate:** M
**Dependencies:** S-02.2, S-01.5 (Tailwind)

### What

A full-screen name entry form shown on first launch (when no profile exists). Blocks access to the rest of the app until a name is set.

### Tasks

1. Create `src/components/Profile/NameEntryScreen.tsx`:
   - Full-screen centered layout
   - Pixel-art styled heading: "What's your name, adventurer?"
   - Text input for name (auto-focused)
   - Submit button: "Start Quest!"
   - Calls `createProfile(name)` on submit
2. Validation:
   - Name must be 1-20 characters
   - Trimmed before saving (no leading/trailing whitespace)
   - Submit button disabled until name is valid
   - Show inline validation message for empty or too-long names
3. Keyboard support:
   - Enter key submits the form
   - Input is auto-focused on mount
4. In `App.tsx`, conditionally render:
   ```tsx
   if (profile === null) return <NameEntryScreen />;
   return <MainApp />;
   ```

### Done When

- [ ] First launch shows the name entry screen (no profile in localStorage)
- [ ] Entering a valid name and submitting creates the profile and shows the main app
- [ ] Empty name cannot be submitted
- [ ] Name > 20 characters cannot be submitted
- [ ] Whitespace-only name cannot be submitted
- [ ] Enter key submits the form
- [ ] Input is auto-focused
- [ ] Screen uses pixel-art font (Press Start 2P) for the heading
- [ ] Subsequent launches skip this screen (profile already exists)

### Accessibility

- `<label>` is associated with the input via `htmlFor`
- Validation error uses `aria-describedby` linking to the error message
- Submit button has clear text (not just an icon)
- Form uses `<form>` element with `onSubmit` (not just a click handler on the button)

---

## S-02.4: Profile Display in HUD

**Type:** Implementation
**Estimate:** S
**Dependencies:** S-02.2, S-01.5

### What

The learner's name is shown in a persistent HUD (heads-up display) bar at the top of the screen during gameplay. This story just adds the name — XP display is added in E-12.

### Tasks

1. Create `src/components/HUD/HUD.tsx`:
   - Fixed top bar with learner name on the left
   - Pixel-art styled, compact (doesn't dominate the screen)
   - Uses `useProfile()` to read the name
2. Create `src/components/HUD/HUDLayout.tsx`:
   - Layout component that renders the HUD bar and children below it
   - Used as the wrapper for all gameplay screens (not the name entry screen)
3. Integrate into `App.tsx`:
   ```tsx
   if (profile === null) return <NameEntryScreen />;
   return (
     <HUDLayout>
       <MainApp />
     </HUDLayout>
   );
   ```

### Done When

- [ ] Learner name appears in the top bar after profile creation
- [ ] HUD bar is visible on all gameplay screens
- [ ] HUD bar is NOT visible on the name entry screen
- [ ] Name updates immediately if changed via settings (S-02.5)

---

## S-02.5: Settings Screen with Name Change

**Type:** Implementation
**Estimate:** S
**Dependencies:** S-02.2, S-02.3

### What

A settings screen accessible from the HUD where the learner can change their name. Name change does not affect progress.

### Tasks

1. Create `src/components/Profile/SettingsScreen.tsx`:
   - Accessible from a gear icon or "Settings" link in the HUD
   - Shows current name in an editable text input (pre-filled)
   - "Save" button calls `updateName(newName)` — same validation as S-02.3
   - "Cancel" button returns to the previous screen
   - Clear visual confirmation that the save succeeded (brief "Saved!" text or similar)
2. Navigation:
   - HUD has a settings button/icon
   - Clicking it shows the settings screen (overlay or route — implementer's choice)
   - Back/cancel returns to the previous view
3. **No progress reset.** Changing the name only updates `codequest:profile`. Progress keys (`codequest:progress:*`) are unaffected.
4. Future-proofing: Leave space in the settings UI for a "Reset Progress" button (not implemented until E-12). A placeholder comment in the component is sufficient.

### Done When

- [ ] Settings screen is accessible from the HUD
- [ ] Current name is pre-filled in the input
- [ ] Changing the name and saving updates localStorage and the HUD immediately
- [ ] Same validation rules as name entry (1-20 chars, trimmed, non-empty)
- [ ] Canceling does not save changes
- [ ] Progress is NOT affected by name change
- [ ] Settings screen uses consistent pixel-art styling

---

## Story Dependency Graph

```
S-02.1 (Types + Storage)
  └── S-02.2 (React Context)
        ├── S-02.3 (Name Entry Screen) ← also needs S-01.5 (Tailwind)
        │     └── S-02.5 (Settings Screen)
        └── S-02.4 (HUD Display) ← also needs S-01.5 (Tailwind)
```

## Suggested Implementation Order

1. **S-02.1** (types and storage — no UI, pure logic)
2. **S-02.2** (context — wires storage into React)
3. **S-02.3** (name entry — first visible feature)
4. **S-02.4** (HUD — name visible during gameplay)
5. **S-02.5** (settings — name editable)

---

## Patterns Established by E-02

These patterns are intentionally reusable and should be followed by later epics:

| Pattern | Established In | Reused By |
|---------|---------------|-----------|
| Typed localStorage wrapper with runtime validation | S-02.1 (`storage.ts`) | E-12 (Progression) |
| React context with load/save for persistent state | S-02.2 (`ProfileContext`) | E-03 (Content), E-12 (Progression) |
| Full-screen gate screen (blocks app until condition met) | S-02.3 (`NameEntryScreen`) | E-03 (Content loading error state) |
| HUD layout wrapper | S-02.4 (`HUDLayout`) | E-12 (XP display), E-04 (Map navigation) |
| Form with validation, accessibility, keyboard support | S-02.3, S-02.5 | Any future form |
