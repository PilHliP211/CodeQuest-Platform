import { useRef, useState } from 'react';
import { BlockEditor, type BlockEditorHandle } from './BlockEditor';
import { loadDevBlockEditorContent } from './devBlockEditorContent';

const devContent = loadDevBlockEditorContent();

export function DevBlockEditorScreen(): React.ReactElement {
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

  return (
    <main className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="mb-4">
        <p className="mb-2 font-pixel text-xs text-yellow-300">Temporary E-06 dev harness</p>
        <h1 className="font-pixel text-sm">{devContent.title}</h1>
      </div>

      <section className="h-[640px]" aria-label="Flag Hunter block editor">
        <BlockEditor
          ref={editorRef}
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
