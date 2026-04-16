import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import { codeQuestTheme } from './blocklyTheme';
import { registerBlocks } from './blockRegistry';
import { RunButton } from './RunButton';
import { CodeLabelTooltip } from './CodeLabelTooltip';
import { createToolboxDefinition } from './toolbox';
import type { ReactElement } from 'react';
import type { BlockDef } from '@/types/content';

export interface BlockEditorHandle {
  getState: () => Record<string, unknown>;
  setState: (state: Record<string, unknown>) => void;
}

export interface BlockEditorProps {
  /** phase 1: blocks only, phase 2: blocks + syntax labels, phase 3: read-only reference */
  phase: 1 | 2 | 3;
  blockDefs: readonly BlockDef[];
  availableBlocks: readonly string[];
  onCodeGenerated: (code: string) => void;
  isRunning: boolean;
  initialState?: Record<string, unknown>;
}

export const BlockEditor = forwardRef<BlockEditorHandle, BlockEditorProps>(function BlockEditor(
  { phase, blockDefs, availableBlocks, onCodeGenerated, isRunning, initialState }: BlockEditorProps,
  ref,
): ReactElement {
  const containerRef = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);
  const initialPropsRef = useRef({ blockDefs, availableBlocks, phase, initialState });

  useImperativeHandle(
    ref,
    () => ({
      getState(): Record<string, unknown> {
        if (workspaceRef.current === null) {
          return {};
        }

        return Blockly.serialization.workspaces.save(workspaceRef.current) as Record<
          string,
          unknown
        >;
      },
      setState(state: Record<string, unknown>): void {
        if (workspaceRef.current === null) {
          return;
        }

        Blockly.serialization.workspaces.load(state, workspaceRef.current);
      },
    }),
    [],
  );

  useEffect(() => {
    if (containerRef.current === null) {
      return undefined;
    }

    const {
      blockDefs: initialBlockDefs,
      availableBlocks: initialAvailableBlocks,
      phase: initialPhase,
      initialState: initialWorkspaceState,
    } = initialPropsRef.current;

    const isReadOnly = initialPhase === 3;

    registerBlocks(initialBlockDefs, initialPhase === 2);

    const workspace = Blockly.inject(containerRef.current, {
      theme: codeQuestTheme,
      toolbox: createToolboxDefinition(initialAvailableBlocks, initialBlockDefs),
      readOnly: isReadOnly,
      scrollbars: true,
      trashcan: !isReadOnly,
      zoom: { controls: true, wheel: true, startScale: 0.9 },
    });

    workspaceRef.current = workspace;

    if (initialWorkspaceState !== undefined) {
      Blockly.serialization.workspaces.load(initialWorkspaceState, workspace);
    }

    return () => {
      workspace.dispose();
      workspaceRef.current = null;
    };
  }, []);

  function handleRun(): void {
    if (workspaceRef.current === null) {
      return;
    }

    onCodeGenerated(javascriptGenerator.workspaceToCode(workspaceRef.current));
  }

  return (
    <div className="flex h-full w-full flex-col gap-3">
      <div className="relative">
        <div
          ref={containerRef}
          aria-label="Block coding workspace"
          className="min-h-96 w-full border-4 border-gray-950 bg-gray-950"
        />
        {phase === 2 && (
          <div className="absolute right-2 top-2">
            <CodeLabelTooltip />
          </div>
        )}
      </div>
      {phase !== 3 && (
        <div className="flex justify-end">
          <RunButton isRunning={isRunning} onRun={handleRun} />
        </div>
      )}
    </div>
  );
});
