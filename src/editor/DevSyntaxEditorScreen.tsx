import { useState } from 'react';
import { EditorToggle, type EditorView } from './EditorToggle';
import { BlocksFallbackHint } from './BlocksFallbackHint';
import { loadDevSyntaxEditorContent } from './devSyntaxEditorContent';
import type { ReactElement } from 'react';

// NOTE: Temporary E-08 dev harness. This route (/__dev/syntax-editor) should
// be removed or folded into LessonScreen once E-11 exposes Phase 3 through the
// real lesson runner and E-14 covers the full Japan playthrough.

const devContent = loadDevSyntaxEditorContent();

export function DevSyntaxEditorScreen(): ReactElement {
  const [code, setCode] = useState(devContent.initialCode);
  const [activeView, setActiveView] = useState<EditorView>('syntax');
  const [attemptCount, setAttemptCount] = useState(0);
  const [lastRunResult, setLastRunResult] = useState<string>('');

  function handleRun(): void {
    setAttemptCount((prev) => prev + 1);
    setLastRunResult(code);
  }

  function handleResetAttempts(): void {
    setAttemptCount(0);
    setLastRunResult('');
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4 text-white">
      <div className="mb-4">
        <p className="mb-2 font-pixel text-xs text-yellow-300">
          Temporary E-08 dev harness — remove when E-11 wires Phase 3 into LessonScreen
        </p>
        <h1 className="font-pixel text-sm">{devContent.title}</h1>
      </div>

      <section className="mb-4 flex items-center gap-3" aria-label="Attempt controls">
        <button
          type="button"
          onClick={handleRun}
          className="rounded border-2 border-white px-3 py-2 font-pixel text-xs"
        >
          Run ▶
        </button>
        <button
          type="button"
          onClick={handleResetAttempts}
          className="rounded border-2 border-gray-500 px-3 py-2 font-pixel text-xs text-gray-300"
        >
          Reset attempts
        </button>
        <p className="font-pixel text-xs text-gray-300" aria-live="polite">
          Attempts: {attemptCount.toString()}
        </p>
      </section>

      <section className="h-[520px]" aria-label="Phase 3 editor">
        <EditorToggle
          activeView={activeView}
          onViewChange={setActiveView}
          syntaxEditorProps={{
            value: code,
            onChange: setCode,
            availableFunctions: devContent.availableFunctions,
          }}
          blockEditorProps={{
            blockDefs: devContent.blocks,
            availableBlocks: devContent.availableBlocks,
            isRunning: false,
            onCodeGenerated: () => {
              // Phase 3 blocks view is read-only — no code is generated from it.
            },
          }}
        />
      </section>

      <section className="mt-4">
        <BlocksFallbackHint
          attemptCount={attemptCount}
          onTryBlocks={() => {
            setActiveView('blocks');
          }}
        />
      </section>

      <pre aria-label="Last run code" className="mt-4 min-h-20 bg-black p-3 text-green-300">
        {lastRunResult}
      </pre>
    </main>
  );
}
