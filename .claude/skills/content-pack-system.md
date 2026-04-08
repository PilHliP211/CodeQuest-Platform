---
name: content-pack-system
description: How content packs work — the cardinal rule that no lesson content lives in platform code. Load when touching anything related to lessons, stories, or content loading.
---

# Content Pack System

## Cardinal Rule

**No lesson content in platform code. Ever.**

If you find yourself writing a string, number, color, position, narrative line, block definition, or success condition in `src/`, stop. It belongs in a content pack JSON file.

The platform is a content-agnostic engine. Swapping the active content pack must produce a completely different course experience with zero platform code changes.

## Layout

```
content/
  flag-hunter/
    course.json              # Course metadata, world map, lesson index
    ATTRIBUTION.md           # Asset credits
    lessons/
      001-japan/
        lesson.json          # Full 3-phase lesson
        assets/              # Sprites, backgrounds for this lesson
```

## Authoritative Schema

`docs/CONTENT_SCHEMA.md` is the source of truth. TypeScript types in `src/types/content.ts` mirror it. If the two ever drift, the schema doc wins — update the types to match.

## Loading

Content packs are statically imported at build time in v1:

```ts
import courseJson from '@content/flag-hunter/course.json';
```

The content loader (`src/engine/contentLoader.ts`) validates the imported JSON against the TypeScript types and exposes it via `ContentContext`.

Validation failures show a dedicated error screen — never a blank page.

## What Goes Where

| Belongs in content pack | Belongs in platform code |
|------------------------|--------------------------|
| Lesson narratives | Narrative renderer component |
| World map node positions | Map rendering logic |
| Block definitions | Block registry that reads them |
| Canvas drawing functions for a lesson | The runtime API surface |
| Success conditions | Success evaluator |
| XP rewards | XP calculation engine |
| Sprites and images | Sprite loading utilities |

## Modifying the Schema

1. Update `docs/CONTENT_SCHEMA.md` first
2. Update `src/types/content.ts` to match
3. Update validation in `src/engine/contentLoader.ts`
4. Update affected content pack JSON files
5. Run the swap test: does swapping content packs still work?
