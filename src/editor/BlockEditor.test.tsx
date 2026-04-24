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
    getToolbox: () => { selectItemByPosition: (position: number) => void };
  }

  const lastWorkspace = { current: null as MockWorkspace | null };
  const lastInjectOptions = { current: null as Record<string, unknown> | null };
  const selectItemByPosition = vi.fn();

  return {
    lastWorkspace,
    lastInjectOptions,
    selectItemByPosition,
    defineBlocksWithJsonArray: vi.fn(),
    inject: vi.fn((_element: Element, options: unknown): MockWorkspace => {
      lastInjectOptions.current = options as Record<string, unknown>;
      const workspace: MockWorkspace = {
        disposed: false,
        state: {},
        dispose(): void {
          this.disposed = true;
        },
        getToolbox() {
          return { selectItemByPosition };
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
    blocklyMock.lastInjectOptions.current = null;
    blocklyMock.defineBlocksWithJsonArray.mockClear();
    blocklyMock.inject.mockClear();
    blocklyMock.selectItemByPosition.mockClear();
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
        phase={1}
        blockDefs={blockDefs}
        availableBlocks={['moveEast']}
        isRunning={false}
        onCodeGenerated={handleCodeGenerated}
      />,
    );

    await user.click(screen.getByRole('button', { name: /run/i }));

    expect(handleCodeGenerated).toHaveBeenCalledWith('moveEast()\n');
  });

  it('passes an empty program to the learner flow without crashing', async () => {
    const handleCodeGenerated = vi.fn();
    const user = userEvent.setup();
    javascriptMock.workspaceToCode.mockReturnValue('');

    render(
      <BlockEditor
        phase={1}
        blockDefs={blockDefs}
        availableBlocks={['moveEast']}
        isRunning={false}
        onCodeGenerated={handleCodeGenerated}
      />,
    );

    await user.click(screen.getByRole('button', { name: /run/i }));

    expect(handleCodeGenerated).toHaveBeenCalledWith('');
  });

  it('disables running while code is already running', () => {
    render(
      <BlockEditor
        phase={1}
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
        phase={1}
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

  it('returns an empty state when the workspace is unavailable', () => {
    const editorRef = createRef<BlockEditorHandle>();

    const { unmount } = render(
      <BlockEditor
        ref={editorRef}
        phase={1}
        blockDefs={blockDefs}
        availableBlocks={['moveEast']}
        isRunning={false}
        onCodeGenerated={vi.fn()}
      />,
    );

    const editor = editorRef.current;
    if (editor === null) {
      throw new Error('Expected BlockEditor ref to be set');
    }

    unmount();

    expect(editor.getState()).toEqual({});
  });

  describe('Phase 1', () => {
    it('renders the workspace as editable', () => {
      render(
        <BlockEditor
          phase={1}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

      expect(blocklyMock.lastInjectOptions.current).toMatchObject({ readOnly: false });
    });

    it('shows the Run button', () => {
      render(
        <BlockEditor
          phase={1}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
    });

    it('does not show the code-label tooltip button', () => {
      render(
        <BlockEditor
          phase={1}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

      expect(
        screen.queryByRole('button', { name: /what are these code labels/i }),
      ).not.toBeInTheDocument();
    });
  });

  it('opens the first toolbox category so learners can see blocks to drag', () => {
    render(
      <BlockEditor
        phase={1}
        blockDefs={blockDefs}
        availableBlocks={['moveEast']}
        isRunning={false}
        onCodeGenerated={vi.fn()}
      />,
    );

    expect(blocklyMock.selectItemByPosition).toHaveBeenCalledWith(0);
  });

  describe('Phase 2', () => {
    it('renders the workspace as editable', () => {
      render(
        <BlockEditor
          phase={2}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

      expect(blocklyMock.lastInjectOptions.current).toMatchObject({ readOnly: false });
    });

    it('shows the Run button', () => {
      render(
        <BlockEditor
          phase={2}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

      expect(screen.getByRole('button', { name: /run/i })).toBeInTheDocument();
    });

    it('shows the code-label tooltip button', () => {
      render(
        <BlockEditor
          phase={2}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

      expect(
        screen.getByRole('button', { name: /what are these code labels/i }),
      ).toBeInTheDocument();
    });

    it('registers blocks with showCode=true so each block carries its code field', () => {
      render(
        <BlockEditor
          phase={2}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

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
  });

  describe('Phase 3', () => {
    it('renders the workspace as read-only', () => {
      render(
        <BlockEditor
          phase={3}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

      expect(blocklyMock.lastInjectOptions.current).toMatchObject({ readOnly: true });
    });

    it('hides the Run button so blocks cannot be run in read-only mode', () => {
      render(
        <BlockEditor
          phase={3}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

      expect(screen.queryByRole('button', { name: /run/i })).not.toBeInTheDocument();
    });

    it('does not show the code-label tooltip button', () => {
      render(
        <BlockEditor
          phase={3}
          blockDefs={blockDefs}
          availableBlocks={['moveEast']}
          isRunning={false}
          onCodeGenerated={vi.fn()}
        />,
      );

      expect(
        screen.queryByRole('button', { name: /what are these code labels/i }),
      ).not.toBeInTheDocument();
    });
  });
});
