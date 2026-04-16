import { lazy, Suspense, useRef } from 'react';
import { BlockEditor, type BlockEditorProps } from './BlockEditor';
import type { SyntaxEditorProps } from './SyntaxEditor';
import type { KeyboardEvent, ReactElement } from 'react';

// Lazy-load Monaco — it is ~2 MB and should only be fetched when a Phase 3
// lesson is actually entered.
const SyntaxEditor = lazy(() =>
  import('./SyntaxEditor').then((m) => ({ default: m.SyntaxEditor })),
);

export type EditorView = 'syntax' | 'blocks';

export interface EditorToggleProps {
  activeView: EditorView;
  onViewChange: (view: EditorView) => void;
  syntaxEditorProps: SyntaxEditorProps;
  /** phase is pinned to 3 inside the toggle — blocks view is read-only reference only. */
  blockEditorProps: Omit<BlockEditorProps, 'phase'>;
}

const TAB_ORDER: readonly EditorView[] = ['syntax', 'blocks'];

export function EditorToggle({
  activeView,
  onViewChange,
  syntaxEditorProps,
  blockEditorProps,
}: EditorToggleProps): ReactElement {
  const syntaxTabRef = useRef<HTMLButtonElement>(null);
  const blocksTabRef = useRef<HTMLButtonElement>(null);

  function focusTab(view: EditorView): void {
    const ref = view === 'syntax' ? syntaxTabRef : blocksTabRef;
    ref.current?.focus();
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>): void {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') {
      return;
    }

    event.preventDefault();
    const currentIndex = TAB_ORDER.indexOf(activeView);
    const delta = event.key === 'ArrowRight' ? 1 : -1;
    const nextIndex = (currentIndex + delta + TAB_ORDER.length) % TAB_ORDER.length;
    const nextView = TAB_ORDER[nextIndex];
    if (nextView === undefined) return;

    onViewChange(nextView);
    focusTab(nextView);
  }

  function tabClassName(view: EditorView): string {
    const base = 'rounded-t border-2 px-3 py-2 font-pixel text-xs';
    const active = activeView === view;
    return active
      ? `${base} border-yellow-300 bg-yellow-300 text-gray-900`
      : `${base} border-gray-500 text-gray-300 hover:border-white hover:text-white`;
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div role="tablist" aria-label="Editor view" className="flex gap-1" onKeyDown={handleKeyDown}>
        <button
          ref={syntaxTabRef}
          type="button"
          role="tab"
          id="tab-syntax"
          aria-selected={activeView === 'syntax'}
          aria-controls="syntax-panel"
          tabIndex={activeView === 'syntax' ? 0 : -1}
          onClick={() => {
            onViewChange('syntax');
          }}
          className={tabClassName('syntax')}
        >
          Code
        </button>
        <button
          ref={blocksTabRef}
          type="button"
          role="tab"
          id="tab-blocks"
          aria-selected={activeView === 'blocks'}
          aria-controls="blocks-panel"
          tabIndex={activeView === 'blocks' ? 0 : -1}
          onClick={() => {
            onViewChange('blocks');
          }}
          className={tabClassName('blocks')}
        >
          Blocks <span className="ml-1 text-[10px] opacity-75">(view only)</span>
        </button>
      </div>

      <div
        id="syntax-panel"
        role="tabpanel"
        aria-labelledby="tab-syntax"
        hidden={activeView !== 'syntax'}
        className="flex-1"
      >
        <Suspense
          fallback={
            <p className="p-4 font-pixel text-xs text-gray-300" role="status">
              Loading code editor…
            </p>
          }
        >
          <SyntaxEditor {...syntaxEditorProps} />
        </Suspense>
      </div>

      <div
        id="blocks-panel"
        role="tabpanel"
        aria-labelledby="tab-blocks"
        hidden={activeView !== 'blocks'}
        className="flex-1"
      >
        <p className="mb-2 font-pixel text-xs text-yellow-300" role="note">
          Blocks view is read-only in Phase 3. Switch back to code to run.
        </p>
        <BlockEditor phase={3} {...blockEditorProps} />
      </div>
    </div>
  );
}
