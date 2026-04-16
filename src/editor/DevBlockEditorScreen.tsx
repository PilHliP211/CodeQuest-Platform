import { useRef, useState } from 'react';
import { BlockEditor, type BlockEditorHandle } from './BlockEditor';
import { loadDevBlockEditorContent } from './devBlockEditorContent';

// NOTE: Temporary E-07 dev harness. This route (/__dev/block-editor?phase=N)
// should be removed or folded into LessonScreen once E-11 exposes Phase 2
// through the real lesson runner.

const devContent = loadDevBlockEditorContent();

function parsePhase(raw: string | null): 1 | 2 | 3 {
  if (raw === '2') return 2;
  if (raw === '3') return 3;
  return 1;
}

export function DevBlockEditorScreen(): React.ReactElement {
  const params = new URLSearchParams(window.location.search);
  const phase = parsePhase(params.get('phase'));

  const editorRef = useRef<BlockEditorHandle>(null);
  const [generatedCode, setGeneratedCode] = useState('');
  const [savedState, setSavedState] = useState<Record<string, unknown> | null>(null);

  function handleSaveState(): void {
    setSavedState(editorRef.current?.getState() ?? {});
  }

  function handleRestoreState(): void {
    if (savedState !== null) {
      editorRef.current?.setState(savedState);
    }
  }

  function phaseLink(p: 1 | 2 | 3): string {
    return `/__dev/block-editor?phase=${p.toString()}`;
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="mb-4">
        <p className="mb-2 font-pixel text-xs text-yellow-300">
          Temporary E-07 dev harness — remove when E-11 wires LessonScreen phases
        </p>
        <h1 className="font-pixel text-sm">{devContent.title}</h1>
      </div>

      <nav className="mb-4 flex gap-2" aria-label="Phase selector">
        {([1, 2, 3] as const).map((p) => (
          <a
            key={p}
            href={phaseLink(p)}
            className={`rounded border-2 px-3 py-1 font-pixel text-xs ${
              phase === p
                ? 'border-yellow-300 bg-yellow-300 text-gray-900'
                : 'border-gray-500 text-gray-300 hover:border-white hover:text-white'
            }`}
            aria-current={phase === p ? 'page' : undefined}
          >
            Phase {p}
          </a>
        ))}
      </nav>

      <section className="h-[640px]" aria-label="Flag Hunter block editor">
        {/* phase 1: blocks only, phase 2: blocks + syntax labels, phase 3: read-only reference */}
        <BlockEditor
          ref={editorRef}
          phase={phase}
          blockDefs={devContent.blocks}
          availableBlocks={devContent.availableBlocks}
          isRunning={false}
          onCodeGenerated={setGeneratedCode}
        />
      </section>

      <section className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={handleSaveState}
          className="rounded border-2 border-white px-3 py-2 font-pixel text-xs"
        >
          Save State
        </button>
        <button
          type="button"
          onClick={handleRestoreState}
          className="rounded border-2 border-white px-3 py-2 font-pixel text-xs"
        >
          Restore State
        </button>
      </section>

      <pre aria-label="Generated code" className="mt-4 min-h-20 bg-black p-3 text-green-300">
        {generatedCode}
      </pre>
      <pre aria-label="Saved state" className="mt-4 min-h-20 bg-black p-3 text-blue-300">
        {savedState === null ? '' : JSON.stringify(savedState, null, 2)}
      </pre>
    </main>
  );
}
