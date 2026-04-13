# CodeQuest Platform — Roadmap

**Version:** 0.1 (Planning)
**Status:** Draft
**Last Updated:** 2026-04-13

---

## Philosophy

CodeQuest is built in thin, vertical slices. Each phase delivers a fully playable, shippable increment — not a collection of half-built systems. The first lesson must feel polished end-to-end before a second lesson is authored.

Every remaining epic must end with a human-testable increment: a developer can run `npm run dev`, follow documented steps, and see behavior that is meaningfully different from the previous epic. If the product screen is not ready yet, the epic may add a clearly named temporary dev harness, but the automated tests must validate the underlying product behavior rather than the harness itself.

---

## Phase 1 — v1 MVP: One Lesson, Full Loop

**Goal:** A fully playable Japan lesson that proves out the entire platform architecture. Embeddable on byram.dev. Given to one real kid for feedback.

**Definition of Done:**
- Learner enters their name and sees a personalized experience
- World map renders with Japan as the first unlockable node
- Phase 1 (Navigate): player writes block-based sequences to travel the map to Japan
- Phase 2 (Investigate): blocks show their syntax; player solves a puzzle to find the flag components
- Phase 3 (Restore): syntax editor is unlocked; player writes `fillBackground` + `drawCircle` to restore Japan's flag
- Flag is added to the collection
- XP is awarded and persisted
- App is deployed to `byram.dev/codequest-platform/`
- App works on desktop Chrome/Firefox/Safari; acceptable on iPad

**Epics in scope:** E-01 through E-15

**Out of scope for v1:**
- Second lesson
- Authoring UI
- Backend of any kind
- Mobile-native layout
- Custom language

---

## Phase 2 — v2: Content Expansion & Authoring

**Goal:** Add 3–5 more countries to the Flag Hunter pack. Build a content authoring UI so non-developers can create lessons without touching JSON.

**Milestones:**
- [ ] Lesson 2: France (introduces `drawRect`, vertical/horizontal stripes — teaches variables)
- [ ] Lesson 3: Germany (tricolor — teaches loops)
- [ ] Lesson 4: USA or Brazil (complex flag — teaches functions)
- [ ] Content authoring UI (web-based, exports JSON + zipped assets)
- [ ] Multi-pack loading (learner can choose between installed content packs)
- [ ] Performance audit on map + canvas for lower-end devices
- [ ] Human-testable checkpoint for each v2 epic: author/export a lesson in `npm run dev`, switch between packs without code changes, and cover the behavior with unit/component tests before adding new lessons

**Epics in scope:** E-16, E-17, continued content for E-14

---

## Phase 3 — v3: Platform Maturity

**Goal:** CodeQuest becomes a general platform that other educators can fork and deploy with their own content packs and (optionally) their own coding languages.

**Milestones:**
- [ ] Custom language / WASM compiler (content pack authors define syntax; E-18)
- [ ] Firebase Auth + Firestore (learner accounts, cross-device sync; E-19)
- [ ] Teacher dashboard (view student progress, assign lessons)
- [ ] Embeddable widget mode (iframe-friendly, minimal chrome)
- [ ] Open-source content pack registry (community-contributed packs)
- [ ] Human-testable checkpoint for each v3 epic: dev playground or emulator-backed product flow plus automated validation for parser/sandbox or sync behavior

---

## Concept Progression Plan (Flag Hunter)

This table shows how flag complexity maps to coding concepts. Each flag is chosen for pedagogical fit, not just geography.

| Lesson | Country              | Flag Complexity       | Concept Introduced        |
| ------ | -------------------- | --------------------- | ------------------------- |
| 001    | Japan                | White bg + red circle | Sequences                 |
| 002    | France               | 3 vertical stripes    | Variables (color names)   |
| 003    | Germany              | 3 horizontal stripes  | Loops (`for`)             |
| 004    | Scandinavia (Norway) | Cross pattern         | Conditionals (`if`)       |
| 005    | USA or Brazil        | Complex / multipart   | Functions (reusable code) |
| 006+   | TBD                  | TBD                   | Nested loops, parameters  |

---

## Guiding Principles

1. **Content-first:** Every platform feature must be provably useful to a content pack author. No platform feature without a content use case.
2. **Kid-first feedback:** After v1, get a real 10-year-old to play it before starting v2. Adjust based on observation, not assumption.
3. **Never hardcode:** No story element, lesson data, or progression rule lives in platform code. If it's in the code, it's a bug.
4. **Earn complexity:** Custom languages, backends, and authoring UIs are earned by proving simpler approaches are insufficient.
5. **One kid's experience > a thousand potential users' hypothetical needs.** Build for the real kid in front of you first.
6. **Every epic must be visible in dev.** Foundational work still needs a human-verifiable surface plus automated tests before the epic is considered done.
