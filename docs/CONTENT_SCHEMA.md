# CodeQuest Platform — Content Pack Schema

**Version:** 0.1 (Planning)
**Status:** Draft
**Last Updated:** 2026-04-06

---

## Overview

A **content pack** is a self-contained directory that fully defines a CodeQuest course. The platform engine reads these files and renders a complete game experience without any platform code changes.

```
content/
└── flag-hunter/                  Content pack root (slug = pack ID)
    ├── course.json               Course metadata, map config, lesson index
    ├── ATTRIBUTION.md            Required: asset credits
    └── lessons/
        └── 001-japan/
            ├── lesson.json       Full lesson definition
            └── assets/           Images, sprites specific to this lesson
```

---

## `course.json`

Top-level descriptor for the entire course.

```jsonc
{
  // Unique identifier for this content pack
  "id": "flag-hunter",
 
  // Display name shown in UI
  "title": "CodeQuest: Flag Hunter",
 
  // Short description shown on course select screen
  "description": "A mysterious villain is erasing countries from history. Chase her across the globe and restore each nation's flag — one line of code at a time.",
 
  // Version string for cache-busting and compatibility checks
  "version": "1.0.0",
 
  // World map configuration
  "map": {
    // Path to the map background image (relative to pack root)
    "backgroundImage": "assets/world-map.png",
 
    // Width and height of the map canvas in pixels
    "width": 1200,
    "height": 600,
 
    // The starting node ID (where the player begins)
    "startNodeId": "001-japan",
 
    // All lesson nodes on the map
    "nodes": [
      {
        // Must match the lessons/ folder name
        "id": "001-japan",
 
        // Display label on the map
        "label": "Japan",
 
        // Position on the map canvas (0-1 normalized, or pixel coords — TBD)
        "x": 0.82,
        "y": 0.28,
 
        // IDs of nodes that unlock when this one is completed
        "unlocksOnComplete": ["002-france"],
 
        // Whether this node is unlocked from the start
        "initiallyUnlocked": true,
 
        // Icon shown when collected (path relative to pack root)
        "collectedIcon": "assets/flags/japan.png"
      }
      // ... more nodes
    ],
 
    // Visual connections between nodes (for drawing lines on the map)
    "edges": [
      { "from": "001-japan", "to": "002-france" }
    ]
  },
 
  // Ordered lesson list (also defines narrative progression)
  "lessons": [
    { "id": "001-japan", "path": "lessons/001-japan/lesson.json" }
  ],
 
  // XP rewards (can be overridden per lesson)
  "xp": {
    "phaseComplete": 10,
    "lessonComplete": 50,
    "hintUsed": -5,
    "syntaxEditorUsed": 5
  },
 
  // End-of-course scene (optional)
  "endScene": {
    "type": "narrative",
    "script": "assets/end-scene.json"
  },
 
  // Villain character config (used across all lessons)
  "villain": {
    "name": "??",           // Filled in by content pack
    "sprite": "assets/villain.png",
    "trailSprite": "assets/villain-trail.png"
  },
 
  // Player character config
  "player": {
    "sprite": "assets/player.png"
  }
}
```

---

## `lesson.json`

Full definition for a single lesson. Every field that can vary per lesson lives here.

```jsonc
{
  // Must match the folder name and course.json node id
  "id": "001-japan",
 
  // Country or location name
  "title": "Japan",
 
  // The coding concept(s) introduced in this lesson
  "concepts": ["sequences"],
 
  // Difficulty label (used for UI badge)
  "difficulty": "beginner",
 
  // === PHASE 1: NAVIGATE ===
  "phase1": {
    // Narrative sequence played before the coding challenge
    "intro": {
      "scenes": [
        {
          "background": "assets/phase1-bg.png",
          "dialogue": [
            {
              "speaker": "Narrator",
              "text": "She's been spotted! The villain was last seen heading east — toward Japan. You'll need to navigate there before her trail goes cold.",
              "portrait": null
            },
            {
              "speaker": "Player",
              "text": "Japan... that's on the other side of the world. Let's move!",
              "portrait": "assets/player-portrait.png"
            }
          ]
        }
      ]
    },
 
    // The concept tutorial callout shown before the coding area
    "conceptIntro": {
      "concept": "sequences",
      "title": "Sequences: Do Things in Order",
      "body": "In coding, a sequence is a list of instructions that run one after another — like steps in a recipe. The computer follows each step exactly, in order.",
      "example": "moveNorth()\nmoveEast()\nmoveEast()"
    },
 
    // The coding challenge
    "challenge": {
      // Description shown above the editor
      "prompt": "Write a sequence of moves to navigate from your current position to Japan.",
 
      // The world map nodes the player must pass through (in order)
      "targetPath": ["node-pacific", "001-japan"],
 
      // Starting position node ID
      "startNode": "node-home-base",
 
      // Blocks available in Phase 1 (references block definitions below)
      "availableBlocks": ["moveNorth", "moveSouth", "moveEast", "moveWest"],
 
      // The correct solution (used to evaluate success, not shown to player)
      "solution": {
        "code": "moveEast()\nmoveEast()\nmoveNorth()"
      },
 
      // Hint sequence (shown after N failures, defined globally or per lesson)
      "hints": [
        { "afterAttempts": 2, "text": "Japan is to the east. Try moving east first." },
        { "afterAttempts": 4, "text": "You need to move east twice, then north once." }
      ]
    },
 
    // Narrative shown after completing the challenge
    "outro": {
      "scenes": [
        {
          "dialogue": [
            {
              "speaker": "Narrator",
              "text": "You've arrived in Japan — but the villain has already been here. The flag... it's gone.",
              "portrait": null
            }
          ]
        }
      ]
    }
  },
 
  // === PHASE 2: INVESTIGATE ===
  "phase2": {
    "intro": {
      "scenes": [
        {
          "background": "assets/phase2-bg.png",
          "dialogue": [
            {
              "speaker": "Local Guide",
              "text": "She left clues everywhere. The flag has two parts — but she's hidden them. Your code will help us find them.",
              "portrait": "assets/guide-portrait.png"
            }
          ]
        }
      ]
    },
 
    // Phase 2 always shows syntax inside blocks
    "showSyntaxInBlocks": true,
 
    "challenge": {
      "prompt": "Run the sequence to search the area and find the flag components.",
      "availableBlocks": ["searchNorth", "searchSouth", "searchEast", "searchWest", "collectItem"],
 
      // Items to be found (displayed as "ingredients" in the UI)
      "items": [
        { "id": "white-background", "label": "White Background", "icon": "assets/item-white.png" },
        { "id": "red-circle", "label": "Red Circle", "icon": "assets/item-circle.png" }
      ],
 
      "solution": {
        "code": "searchEast()\ncollectItem()\nsearchNorth()\ncollectItem()"
      },
 
      "hints": [
        { "afterAttempts": 2, "text": "Try searching to the east first." }
      ]
    },
 
    // The "reveal" shown when all items are found
    "reveal": {
      "scenes": [
        {
          "dialogue": [
            {
              "speaker": "Narrator",
              "text": "You found them! A white background... and a red circle. Now you know what to build.",
              "portrait": null
            }
          ]
        }
      ]
    }
  },
 
  // === PHASE 3: RESTORE ===
  "phase3": {
    "intro": {
      "scenes": [
        {
          "background": "assets/phase3-bg.png",
          "dialogue": [
            {
              "speaker": "Local Guide",
              "text": "The restoration canvas is ready. Use the ingredients you found to rebuild Japan's flag with code.",
              "portrait": "assets/guide-portrait.png"
            }
          ]
        }
      ]
    },
 
    // Canvas configuration
    "canvas": {
      // Dimensions of the flag canvas in pixels
      "width": 300,
      "height": 200,
 
      // Which renderer API functions are available to the player
      "availableFunctions": [
        {
          "name": "fillBackground",
          "signature": "fillBackground(color: string)",
          "description": "Fill the entire canvas with a color",
          "example": "fillBackground(\"white\")"
        },
        {
          "name": "drawCircle",
          "signature": "drawCircle(x: number, y: number, radius: number, color: string)",
          "description": "Draw a filled circle at position (x, y)",
          "example": "drawCircle(150, 100, 60, \"red\")"
        }
      ],
 
      // The target output — used for semantic success evaluation
      "solution": {
        "calls": [
          { "fn": "fillBackground", "args": ["white"] },
          { "fn": "drawCircle", "args": [150, 100, 60, "red"] }
        ]
      },
 
      // Tolerance for position/size arguments (for drawCircle x/y/radius)
      "tolerance": 15
    },
 
    // Prompt shown above the editor
    "prompt": "Restore Japan's flag. Fill the background white, then draw the red circle.",
 
    // Blocks available (read-only reference when syntax editor is active)
    "availableBlocks": ["fillBackground", "drawCircle"],
 
    // Number of failed attempts before "try blocks" option appears
    "fallbackAfterAttempts": 3,
 
    "hints": [
      { "afterAttempts": 2, "text": "Start with fillBackground(\"white\") to set the background color." },
      { "afterAttempts": 4, "text": "The circle goes in the center: drawCircle(150, 100, 60, \"red\")" }
    ],
 
    // Celebration shown on success
    "celebration": {
      "animation": "flag-restore",
      "message": "Japan's flag has been restored! 🇯🇵",
      "xpBonus": 50
    }
  },
 
  // === BLOCK DEFINITIONS ===
  // Custom Blockly blocks used in this lesson.
  // These are registered with Blockly at runtime.
  "blocks": [
    {
      "id": "moveEast",
      "label": "Move East",
      "category": "Movement",
      "color": 160,
      // The simplified-JS code this block generates
      "code": "moveEast()",
      // Blockly JSON block definition (shape, inputs, etc.)
      "blocklyDef": {
        "type": "move_east",
        "message0": "Move East",
        "previousStatement": null,
        "nextStatement": null,
        "colour": 160,
        "tooltip": "Move one step to the east",
        "helpUrl": ""
      }
    }
    // ... more blocks
  ]
}
```

---

## Block Definition Conventions

- Each block maps 1:1 to a simplified-JS function call
- Block color is consistent per category across all lessons:

| Category         | Blockly Color |
| ---------------- | ------------- |
| Movement         | 160 (green)   |
| Search / Collect | 210 (blue)    |
| Drawing          | 20 (orange)   |
| Logic            | 210 (blue)    |
| Loops            | 120 (teal)    |
| Functions        | 290 (purple)  |

---

## Simplified-JS Language Subset

Phase 3 and future lessons use a simplified JavaScript subset. Rules:

### Allowed
- Function calls: `fillBackground("white")`
- Variable declarations: `let x = 10`
- Arithmetic: `+`, `-`, `*`, `/`
- String literals (color names, labels)
- Number literals
- `for` loops: `for (let i = 0; i < 3; i++) { ... }`
- `if` / `else if` / `else`
- Function definitions: `function myFunc() { ... }`

### Not Allowed (blocked by interpreter)
- `var`, `const` (use `let`)
- `eval`, `Function()`
- Any identifier referencing `window`, `document`, `localStorage`, `fetch`
- `import`, `export`, `require`
- Prototype access (`__proto__`, `constructor`)
- Any function not in the lesson's `availableFunctions` whitelist

---

## Asset Conventions

```
lessons/001-japan/assets/
├── phase1-bg.png         Background image for Phase 1 scenes
├── phase2-bg.png         Background image for Phase 2 scenes
├── phase3-bg.png         Background image for Phase 3 scenes
├── player-portrait.png   Player dialogue portrait (64x64 or 128x128)
├── guide-portrait.png    NPC portrait for this lesson
└── item-white.png        Item icon for collected ingredient
```

Global assets (used across the whole course) live in the pack root:
```
flag-hunter/assets/
├── world-map.png
├── player.png
├── villain.png
├── villain-trail.png
└── flags/
    └── japan.png         Flag icon shown in collection and on map node
```

---

## Narrative Script Format

Narrative scenes (used in `intro`, `outro`, `reveal`, `celebration`) follow this structure:

```jsonc
{
  "scenes": [
    {
      // Optional background image override
      "background": "assets/phase1-bg.png",
 
      // Sequence of dialogue lines
      "dialogue": [
        {
          "speaker": "Narrator",        // Display name
          "text": "...",                // Dialogue text (supports newlines)
          "portrait": null,            // Portrait image path, or null for no portrait
          "emotion": "neutral"         // Optional: neutral | happy | shocked | worried
        }
      ],
 
      // Optional: wait for player tap/click before advancing
      "advanceOnInput": true
    }
  ]
}
```