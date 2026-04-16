import { createRef } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { BlockDef } from '@/types/content';

const blocklyMock = vi.hoisted(() => {
  interface MockWorkspace {
    disposed: boolean;
    state: Record<string, unknown>;
    dispose: () => void;
  }

  const lastWorkspace = { current: null as MockWorkspace | null };

  return {
    lastWorkspace,
    defineBlocksWithJsonArray: vi.fn(),
    inject: vi.fn((_element: Element, _options: unknown): MockWorkspace => {
      const workspace: MockWorkspace = {
        disposed: false,
        state: {},
        dispose(): void {
          this.disposed = true;
        },
      };
      lastWorkspace.current = workspace;
      return workspace;
    }),
    save: vi.fn((workspace: MockWorkspace): Record<string, unknown> => workspace.state),
    load: vi.fn((state: Record<string, unknown>, workspace: MockWorkspace): void => {
      workspace.state = state;
    }),
    defineTheme: vi.fn((_name: string, theme: unknown): unknown => theme),
  };
});

const javascriptMock = vi.hoisted(() => {
  type GeneratorFunction = (block: unknown, generator: unknown) => string | [string, number] | null;

  return {
    forBlock: {} as Record<string, GeneratorFunction>,
    workspaceToCode: vi.fn(() => 'moveEast()\n'),
  };
});

vi.mock('blockly/core', () => ({
  Theme: {
    defineTheme: blocklyMock.defineTheme,
  },
  Themes: {
    Classic: {},
  },
  defineBlocksWithJsonArray: blocklyMock.defineBlocksWithJsonArray,
  inject: blocklyMock.inject,
  serialization: {
    workspaces: {
      save: blocklyMock.save,
      load: blocklyMock.load,
    },
  },
}));

vi.mock('blockly/javascript', () => ({
  javascriptGenerator: javascriptMock,
}));

import { BlockEditor, type BlockEditorHandle } from './BlockEditor';

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

const blockDefs = [makeBlockDef('moveEast', 'Movement', 'moveEast()')];

describe('BlockEditor', () => {
  beforeEach(() => {
    blocklyMock.lastWorkspace.current = null;
    blocklyMock.defineBlocksWithJsonArray.mockClear();
    blocklyMock.inject.mockClear();
    blocklyMock.save.mockClear();
    blocklyMock.load.mockClear();
    javascriptMock.workspaceToCode.mockClear();
    javascriptMock.workspaceToCode.mockReturnValue('moveEast()\n');

    for (const key of Object.keys(javascriptMock.forBlock)) {
      Reflect.deleteProperty(javascriptMock.forBlock, key);
    }
  });

  it('generates Blockly code for the learner when Run is clicked', async () => {
    const handleCodeGenerated = vi.fn();
    const user = userEvent.setup();

    render(
      <BlockEditor
        blockDefs={blockDefs}
        availableBlocks={['moveEast']}
        isRunning={false}
        onCodeGenerated={handleCodeGenerated}
      />,
    );

    await user.click(screen.getByRole('button', { name: /run/i }));

    expect(handleCodeGenerated).toHaveBeenCalledWith('moveEast()\n');
  });

  it('disables running while code is already running', () => {
    render(
      <BlockEditor
        blockDefs={blockDefs}
        availableBlocks={['moveEast']}
        isRunning={true}
        onCodeGenerated={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /running/i })).toBeDisabled();
  });

  it('saves and restores workspace state through the editor handle', () => {
    const editorRef = createRef<BlockEditorHandle>();
    const initialState = { blocks: { languageVersion: 0 } };
    const nextState = { blocks: { languageVersion: 1 } };

    render(
      <BlockEditor
        ref={editorRef}
        blockDefs={blockDefs}
        availableBlocks={['moveEast']}
        initialState={initialState}
        isRunning={false}
        onCodeGenerated={vi.fn()}
      />,
    );

    const editor = editorRef.current;
    if (editor === null) {
      throw new Error('Expected BlockEditor ref to be set');
    }

    expect(editor.getState()).toEqual(initialState);

    editor.setState(nextState);

    expect(editor.getState()).toEqual(nextState);
  });
});
