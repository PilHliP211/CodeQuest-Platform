import React, { useRef } from 'react';
import { BlockEditor } from './BlockEditor';
import type { BlockEditorProps } from './BlockEditor';
import type { SyntaxEditorProps } from './SyntaxEditor';

const LazySyntaxEditor = React.lazy(() =>
  import('./SyntaxEditor').then((module) => ({ default: module.SyntaxEditor })),
);

export type EditorView = 'blocks' | 'syntax';

export interface EditorToggleProps {
  activeView: EditorView;
  onViewChange: (view: EditorView) => void;
  syntaxEditorProps: SyntaxEditorProps;
  blockEditorProps: Omit<BlockEditorProps, 'phase'>;
  failedAttempts?: number;
  fallbackAfterAttempts?: number;
}

export function EditorToggle({
  activeView,
  onViewChange,
  syntaxEditorProps,
  blockEditorProps,
  failedAttempts = 0,
  fallbackAfterAttempts = 3,
}: EditorToggleProps): React.ReactElement {
  const syntaxTabRef = useRef<HTMLButtonElement>(null);
  const blocksTabRef = useRef<HTMLButtonElement>(null);
  const showFallback = failedAttempts >= fallbackAfterAttempts && activeView !== 'blocks';

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    const nextView = activeView === 'syntax' ? 'blocks' : 'syntax';
    onViewChange(nextView);

    if (nextView === 'syntax') {
      syntaxTabRef.current?.focus();
    } else {
      blocksTabRef.current?.focus();
    }
  }

  const syntaxSelected = activeView === 'syntax';
  const blocksSelected = activeView === 'blocks';

  return (
    <div className="flex h-full flex-col gap-3">
      <div
        role="tablist"
        aria-label="Editor view"
        onKeyDown={handleKeyDown}
        className="flex flex-wrap gap-2 border-b-4 border-gray-950 pb-2"
      >
        <button
          ref={syntaxTabRef}
          id="tab-syntax"
          type="button"
          role="tab"
          aria-selected={syntaxSelected}
          aria-controls="syntax-panel"
          tabIndex={syntaxSelected ? 0 : -1}
          onClick={() => {
            onViewChange('syntax');
          }}
          className={`rounded border-2 px-3 py-2 font-pixel text-xs ${
            syntaxSelected
              ? 'border-yellow-300 bg-yellow-300 text-gray-950'
              : 'border-gray-500 bg-gray-800 text-gray-200 hover:border-white'
          }`}
        >
          Code
        </button>
        <button
          ref={blocksTabRef}
          id="tab-blocks"
          type="button"
          role="tab"
          aria-selected={blocksSelected}
          aria-controls="blocks-panel"
          tabIndex={blocksSelected ? 0 : -1}
          onClick={() => {
            onViewChange('blocks');
          }}
          className={`rounded border-2 px-3 py-2 font-pixel text-xs ${
            blocksSelected
              ? 'border-yellow-300 bg-yellow-300 text-gray-950'
              : 'border-gray-500 bg-gray-800 text-gray-200 hover:border-white'
          }`}
        >
          Blocks <span aria-label="view only">(view only)</span>
        </button>
      </div>

      {showFallback && (
        <button
          type="button"
          onClick={() => {
            onViewChange('blocks');
          }}
          className="self-start rounded border-2 border-yellow-300 bg-gray-950 px-3 py-2 font-pixel text-xs text-yellow-300 hover:bg-yellow-300 hover:text-gray-950"
        >
          Need help? Try blocks -&gt;
        </button>
      )}

      <div
        id="syntax-panel"
        role="tabpanel"
        aria-labelledby="tab-syntax"
        hidden={!syntaxSelected}
        className="min-h-0 flex-1"
      >
        <React.Suspense
          fallback={<p className="font-pixel text-xs text-green-300">Loading code editor...</p>}
        >
          <LazySyntaxEditor {...syntaxEditorProps} />
        </React.Suspense>
      </div>

      <div
        id="blocks-panel"
        role="tabpanel"
        aria-labelledby="tab-blocks"
        hidden={!blocksSelected}
        className="min-h-0 flex-1"
      >
        {blocksSelected && (
          <p className="mb-2 font-pixel text-xs leading-relaxed text-yellow-300">
            Blocks view is read-only in Phase 3. Switch back to code to run.
          </p>
        )}
        <BlockEditor phase={3} {...blockEditorProps} />
      </div>
    </div>
  );
}
