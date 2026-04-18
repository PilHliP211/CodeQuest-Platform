import { useState } from 'react';
import { loadSyntaxUnlocked, saveSyntaxUnlocked } from '@/engine/progressStore';
import { EditorToggle, type EditorView } from './EditorToggle';
import { loadDevSyntaxEditorContent } from './devSyntaxEditorContent';

// NOTE: Temporary E-08 dev harness. This route (/__dev/syntax-editor)
// should be removed or folded into LessonScreen once E-11 exposes Phase 3
// through the real lesson runner.

const devContent = loadDevSyntaxEditorContent();

function normalizeCode(code: string): string {
  return code
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

export function DevSyntaxEditorScreen(): React.ReactElement {
  const [syntaxUnlocked, setSyntaxUnlocked] = useState(() =>
    loadSyntaxUnlocked(devContent.packId, devContent.lessonId),
  );
  const [activeView, setActiveView] = useState<EditorView>('syntax');
  const [code, setCode] = useState(devContent.initialCode);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [runMessage, setRunMessage] = useState(
    'Run the solution or make mistakes to test fallback.',
  );

  function handleUnlock(): void {
    saveSyntaxUnlocked(devContent.packId, devContent.lessonId);
    setSyntaxUnlocked(true);
  }

  function handleRun(nextCode: string): void {
    if (normalizeCode(nextCode) === normalizeCode(devContent.solutionCode)) {
      setFailedAttempts(0);
      setRunMessage("Japan's flag code is ready.");
      return;
    }

    setFailedAttempts((currentAttempts) => currentAttempts + 1);
    setRunMessage(
      'That did not restore the flag yet. Check the available functions and try again.',
    );
  }

  if (!syntaxUnlocked) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-6 text-center text-white">
        <p className="mb-3 font-pixel text-xs leading-relaxed text-yellow-300">
          Temporary E-08 dev harness — unlock state is saved with the progress key schema.
        </p>
        <h1 className="mb-4 font-pixel text-base text-green-300">{devContent.title}</h1>
        <p className="mb-6 max-w-2xl font-pixel text-xs leading-relaxed text-gray-200">
          Phase 3 starts after Phase 2. This button simulates that lesson transition until the
          lesson runner exists.
        </p>
        <button
          type="button"
          onClick={handleUnlock}
          className="rounded border-2 border-green-300 bg-green-400 px-4 py-3 font-pixel text-xs text-gray-950 hover:bg-green-300"
        >
          Unlock Phase 3 Editor
        </button>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-gray-900 p-4 text-white">
      <header className="flex flex-col gap-2">
        <p className="font-pixel text-xs leading-relaxed text-yellow-300">
          Temporary E-08 dev harness — remove when E-11 wires LessonScreen Phase 3
        </p>
        <h1 className="font-pixel text-sm text-green-300">{devContent.title}</h1>
        <p className="max-w-4xl font-pixel text-xs leading-relaxed text-gray-200">
          {devContent.prompt}
        </p>
      </header>

      <section className="min-h-[560px]" aria-label="Phase 3 syntax editor">
        <EditorToggle
          activeView={activeView}
          onViewChange={setActiveView}
          failedAttempts={failedAttempts}
          fallbackAfterAttempts={devContent.fallbackAfterAttempts}
          syntaxEditorProps={{
            value: code,
            onChange: setCode,
            onRun: handleRun,
            isRunning: false,
            availableFunctions: devContent.availableFunctions,
            height: '460px',
          }}
          blockEditorProps={{
            blockDefs: devContent.blocks,
            availableBlocks: devContent.availableBlocks,
            onCodeGenerated: () => undefined,
            isRunning: false,
          }}
        />
      </section>

      <section
        role="status"
        aria-live="polite"
        className="rounded border-2 border-gray-700 bg-gray-950 p-3 font-pixel text-xs leading-relaxed text-green-200"
      >
        <p>{runMessage}</p>
        <p>Failed attempts: {failedAttempts}</p>
      </section>
    </main>
  );
}
