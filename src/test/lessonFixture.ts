import type { Lesson } from '@/types/content';

export const testLesson: Lesson = {
  id: '001-japan',
  title: 'Japan',
  concepts: ['sequences'],
  difficulty: 'beginner',
  phase1: {
    intro: {
      scenes: [{ dialogue: [{ speaker: 'Guide', text: 'Phase 1 intro', portrait: null }] }],
    },
    conceptIntro: {
      concept: 'sequences',
      title: 'Sequences',
      body: 'Run instructions in order.',
      example: 'moveEast()',
    },
    challenge: {
      prompt: 'Move to Japan.',
      targetPath: ['001-japan'],
      startNode: 'home-base',
      availableBlocks: ['moveEast'],
      solution: { code: 'moveEast()' },
      hints: [{ afterAttempts: 1, text: 'Move east.' }],
    },
    outro: {
      scenes: [{ dialogue: [{ speaker: 'Guide', text: 'Phase 1 outro', portrait: null }] }],
    },
  },
  phase2: {
    intro: {
      scenes: [{ dialogue: [{ speaker: 'Guide', text: 'Phase 2 intro', portrait: null }] }],
    },
    showSyntaxInBlocks: true,
    challenge: {
      prompt: 'Find the flag pieces.',
      availableBlocks: ['searchArea', 'collectItem'],
      items: [
        { id: 'white-background', label: 'White background', icon: 'white.png' },
        { id: 'red-circle', label: 'Red circle', icon: 'red.png' },
      ],
      solution: { code: 'searchArea()\ncollectItem()' },
      hints: [{ afterAttempts: 1, text: 'Search before collecting.' }],
    },
    reveal: {
      scenes: [{ dialogue: [{ speaker: 'Guide', text: 'Phase 2 reveal', portrait: null }] }],
    },
  },
  phase3: {
    intro: {
      scenes: [{ dialogue: [{ speaker: 'Guide', text: 'Phase 3 intro', portrait: null }] }],
    },
    canvas: {
      width: 300,
      height: 200,
      availableFunctions: [
        {
          name: 'fillBackground',
          signature: 'fillBackground(color: string)',
          description: 'Fill the canvas.',
          example: 'fillBackground("white")',
        },
        {
          name: 'drawCircle',
          signature: 'drawCircle(x: number, y: number, radius: number, color: string)',
          description: 'Draw a circle.',
          example: 'drawCircle(150, 100, 60, "red")',
        },
      ],
      solution: {
        calls: [
          { fn: 'fillBackground', args: ['white'] },
          { fn: 'drawCircle', args: [150, 100, 60, 'red'] },
        ],
      },
      tolerance: 2,
    },
    prompt: 'Restore the flag.',
    availableBlocks: ['fillBackground', 'drawCircle'],
    fallbackAfterAttempts: 3,
    hints: [{ afterAttempts: 1, text: 'Start with the white background.' }],
    celebration: {
      animation: 'flag-restore',
      message: 'Japan flag restored.',
      xpBonus: 50,
    },
  },
  blocks: [
    {
      id: 'moveEast',
      label: 'Move East',
      category: 'Movement',
      color: 160,
      code: 'moveEast()',
      blocklyDef: {
        type: 'moveEast',
        message0: 'Move East',
        previousStatement: null,
        nextStatement: null,
        colour: 160,
        tooltip: 'Move east.',
        helpUrl: '',
      },
    },
    {
      id: 'searchArea',
      label: 'Search Area',
      category: 'Search / Collect',
      color: 210,
      code: 'searchArea()',
      blocklyDef: {
        type: 'searchArea',
        message0: 'Search Area',
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: 'Search.',
        helpUrl: '',
      },
    },
    {
      id: 'collectItem',
      label: 'Collect Item',
      category: 'Search / Collect',
      color: 210,
      code: 'collectItem()',
      blocklyDef: {
        type: 'collectItem',
        message0: 'Collect Item',
        previousStatement: null,
        nextStatement: null,
        colour: 210,
        tooltip: 'Collect.',
        helpUrl: '',
      },
    },
    {
      id: 'fillBackground',
      label: 'Fill Background',
      category: 'Drawing',
      color: 20,
      code: 'fillBackground("white")',
      blocklyDef: {
        type: 'fillBackground',
        message0: 'Fill Background',
        previousStatement: null,
        nextStatement: null,
        colour: 20,
        tooltip: 'Fill background.',
        helpUrl: '',
      },
    },
    {
      id: 'drawCircle',
      label: 'Draw Circle',
      category: 'Drawing',
      color: 20,
      code: 'drawCircle(150, 100, 60, "red")',
      blocklyDef: {
        type: 'drawCircle',
        message0: 'Draw Circle',
        previousStatement: null,
        nextStatement: null,
        colour: 20,
        tooltip: 'Draw circle.',
        helpUrl: '',
      },
    },
  ],
};
