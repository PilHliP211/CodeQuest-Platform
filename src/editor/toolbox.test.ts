import { describe, expect, it, vi } from 'vitest';
import { createToolboxDefinition } from './toolbox';
import type { BlockDef } from '@/types/content';

function makeBlockDef(id: string, category: string): BlockDef {
  return {
    id,
    label: id,
    category,
    color: 160,
    code: `${id}()`,
    blocklyDef: {
      type: id,
      message0: id,
      previousStatement: null,
      nextStatement: null,
      colour: 160,
      tooltip: id,
      helpUrl: '',
    },
  };
}

describe('createToolboxDefinition', () => {
  it('groups the learner-visible blocks by content category', () => {
    const toolbox = createToolboxDefinition(
      ['moveEast', 'moveWest', 'drawCircle'],
      [
        makeBlockDef('moveEast', 'Movement'),
        makeBlockDef('drawCircle', 'Drawing'),
        makeBlockDef('moveWest', 'Movement'),
      ],
    );

    expect(toolbox).toEqual({
      kind: 'categoryToolbox',
      contents: [
        {
          kind: 'category',
          name: 'Movement',
          contents: [
            { kind: 'block', type: 'moveEast' },
            { kind: 'block', type: 'moveWest' },
          ],
        },
        {
          kind: 'category',
          name: 'Drawing',
          contents: [{ kind: 'block', type: 'drawCircle' }],
        },
      ],
    });
  });

  it('only includes blocks listed as available for the current phase', () => {
    const toolbox = createToolboxDefinition(
      ['moveEast'],
      [makeBlockDef('moveEast', 'Movement'), makeBlockDef('moveWest', 'Movement')],
    );

    expect(toolbox.contents).toEqual([
      {
        kind: 'category',
        name: 'Movement',
        contents: [{ kind: 'block', type: 'moveEast' }],
      },
    ]);
  });

  it('warns and skips available block ids without matching content definitions', () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const toolbox = createToolboxDefinition(
      ['moveEast', 'moveNorth'],
      [makeBlockDef('moveEast', 'Movement')],
    );

    expect(toolbox.contents).toEqual([
      {
        kind: 'category',
        name: 'Movement',
        contents: [{ kind: 'block', type: 'moveEast' }],
      },
    ]);
    expect(warnSpy).toHaveBeenCalledWith(
      'Block "moveNorth" is listed as available but has no matching block definition.',
    );

    warnSpy.mockRestore();
  });
});
