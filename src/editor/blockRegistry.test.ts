import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { BlockDef } from '@/types/content';

const blocklyMock = vi.hoisted(() => ({
  defineBlocksWithJsonArray: vi.fn(),
}));

const javascriptMock = vi.hoisted(() => {
  type GeneratorFunction = (block: unknown, generator: unknown) => string | [string, number] | null;

  return {
    forBlock: {} as Record<string, GeneratorFunction>,
  };
});

vi.mock('blockly/core', () => ({
  defineBlocksWithJsonArray: blocklyMock.defineBlocksWithJsonArray,
}));

vi.mock('blockly/javascript', () => ({
  javascriptGenerator: javascriptMock,
}));

import { registerBlocks } from './blockRegistry';

function makeBlockDef(id: string, category: string, code: string): BlockDef {
  return {
    id,
    label: id,
    category,
    color: 160,
    code,
    blocklyDef: {
      type: `${id}_shape`,
      message0: id,
      previousStatement: null,
      nextStatement: null,
      colour: 160,
      tooltip: id,
      helpUrl: '',
    },
  };
}

describe('registerBlocks', () => {
  beforeEach(() => {
    blocklyMock.defineBlocksWithJsonArray.mockClear();

    for (const key of Object.keys(javascriptMock.forBlock)) {
      Reflect.deleteProperty(javascriptMock.forBlock, key);
    }
  });

  it('registers lesson block shapes using content category styles', () => {
    registerBlocks([
      makeBlockDef('moveEast', 'Movement', 'moveEast()'),
      makeBlockDef('collectItem', 'Search / Collect', 'collectItem()'),
    ]);

    expect(blocklyMock.defineBlocksWithJsonArray).toHaveBeenCalledWith([
      {
        type: 'moveEast',
        message0: 'moveEast',
        previousStatement: null,
        nextStatement: null,
        tooltip: 'moveEast',
        helpUrl: '',
        style: 'movement_blocks',
      },
      {
        type: 'collectItem',
        message0: 'collectItem',
        previousStatement: null,
        nextStatement: null,
        tooltip: 'collectItem',
        helpUrl: '',
        style: 'search_blocks',
      },
    ]);
  });

  it('generates the pre-authored code string for each block', () => {
    registerBlocks([makeBlockDef('moveEast', 'Movement', 'moveEast()')]);

    const generator = javascriptMock.forBlock.moveEast;
    if (generator === undefined) {
      throw new Error('Expected moveEast generator to be registered');
    }

    expect(generator({}, {})).toBe('moveEast()\n');
  });

  it('omits code labels when showCode is false (Phase 1 default)', () => {
    registerBlocks([makeBlockDef('moveEast', 'Movement', 'moveEast()')], false);

    // Exact match — no message1/args1 properties should appear
    expect(blocklyMock.defineBlocksWithJsonArray).toHaveBeenCalledWith([
      {
        type: 'moveEast',
        message0: 'moveEast',
        previousStatement: null,
        nextStatement: null,
        tooltip: 'moveEast',
        helpUrl: '',
        style: 'movement_blocks',
      },
    ]);
  });

  it('injects message1 from BlockDef.code when showCode is true (Phase 2)', () => {
    registerBlocks([makeBlockDef('moveEast', 'Movement', 'moveEast()')], true);

    expect(blocklyMock.defineBlocksWithJsonArray).toHaveBeenCalledWith([
      {
        type: 'moveEast',
        message0: 'moveEast',
        previousStatement: null,
        nextStatement: null,
        tooltip: 'moveEast',
        helpUrl: '',
        style: 'movement_blocks',
        message1: 'moveEast()',
        args1: [],
      },
    ]);
  });

  it('sources the code label text from BlockDef.code, not reconstructed', () => {
    registerBlocks([makeBlockDef('moveNorth', 'Movement', 'moveNorth("fast")')], true);

    expect(blocklyMock.defineBlocksWithJsonArray).toHaveBeenCalledWith([
      {
        type: 'moveNorth',
        message0: 'moveNorth',
        previousStatement: null,
        nextStatement: null,
        tooltip: 'moveNorth',
        helpUrl: '',
        style: 'movement_blocks',
        message1: 'moveNorth("fast")',
        args1: [],
      },
    ]);
  });
});
