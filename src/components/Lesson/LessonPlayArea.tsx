import { useEffect, useRef, useState } from 'react';
import { NarrativePlayer } from '@/components/Narrative';
import { useContent } from '@/engine/useContent';
import { useLessonRunner } from '@/engine/useLessonRunner';
import { getActiveHint, getCurrentPhaseHints } from '@/engine/hintSelector';
import { getPendingNarrative } from '@/engine/narrativeSelector';
import { calculateLessonXP, calculatePhaseXP } from '@/engine/xpCalculator';
import { addXP, saveSyntaxUnlocked } from '@/engine/progressStore';
import { execute, formatErrorForDisplay } from '@/engine/interpreter';
import { BlockEditor } from '@/editor/BlockEditor';
import { EditorToggle, type EditorView } from '@/editor/EditorToggle';
import { CanvasRenderer, type CanvasRendererHandle } from '@/renderer/CanvasRenderer';
import { buildRendererScope, createRendererAPI } from '@/renderer/rendererAPI';
import { evaluateSuccess } from '@/renderer/successEvaluator';

interface LessonPlayAreaProps {
  onReturnToMap: () => void;
}

export function LessonPlayArea({ onReturnToMap }: LessonPlayAreaProps): React.ReactElement {
  const canvasRef = useRef<CanvasRendererHandle>(null);
  const [editorView, setEditorView] = useState<EditorView>('syntax');
  const [phase3Code, setPhase3Code] = useState('');
  const [hintOpen, setHintOpen] = useState(false);
  const [viewedHintKeys, setViewedHintKeys] = useState<readonly string[]>([]);
  const [awardedXP, setAwardedXP] = useState(0);

  const { course } = useContent();
  const { lesson, lessonState, dispatch } = useLessonRunner();

  const activeHint = getActiveHint(
    getCurrentPhaseHints(lesson, lessonState.currentPhase),
    lessonState.attemptCount,
  );
  const pendingNarrative = getPendingNarrative(lesson, lessonState);
  const isRunning = lessonState.phaseStatus === 'running';

  useEffect(() => {
    setHintOpen(false);
  }, [activeHint]);

  function awardPhaseXP(): void {
    const amount = calculatePhaseXP(course.xp, lessonState.hintsUsed);
    addXP(amount);
    setAwardedXP((current) => current + amount);
  }

  function handleNarrativeComplete(): void {
    dispatch({ type: 'NARRATIVE_COMPLETE' });
  }

  function handleShowHint(): void {
    if (activeHint === null || lessonState.currentPhase === 'complete') {
      return;
    }

    const hintKey = `${lessonState.currentPhase.toString()}:${activeHint}`;
    if (!viewedHintKeys.includes(hintKey)) {
      setViewedHintKeys([...viewedHintKeys, hintKey]);
      dispatch({ type: 'SHOW_HINT' });
    }

    setHintOpen((current) => !current);
  }

  function handleBlockCodeGenerated(code: string): void {
    if (lessonState.currentPhase !== 1 && lessonState.currentPhase !== 2) {
      return;
    }

    dispatch({ type: 'RUN_CODE' });

    const solution =
      lessonState.currentPhase === 1
        ? lesson.phase1.challenge.solution.code
        : lesson.phase2.challenge.solution.code;

    if (normalizeCode(code) !== normalizeCode(solution)) {
      dispatch({
        type: 'RUN_FAIL',
        error: 'That sequence did not solve the challenge yet. Try another order.',
      });
      return;
    }

    if (lessonState.currentPhase === 2) {
      saveSyntaxUnlocked(course.id, lesson.id);
    }

    awardPhaseXP();
    dispatch({ type: 'RUN_SUCCESS' });
  }

  function handlePhase3Run(code: string): void {
    dispatch({ type: 'RUN_CODE' });

    const renderer = canvasRef.current;
    if (renderer === null) {
      dispatch({ type: 'RUN_FAIL', error: 'The canvas is not ready yet. Try again.' });
      return;
    }

    const rendererAPI = createRendererAPI(renderer.getContext());
    rendererAPI.reset();

    const result = execute(
      code,
      buildRendererScope(rendererAPI, lesson.phase3.canvas.availableFunctions),
    );
    if (!result.success) {
      dispatch({ type: 'RUN_FAIL', error: formatErrorForDisplay(result.error) });
      return;
    }

    const restored = evaluateSuccess(
      rendererAPI.getCallLog(),
      lesson.phase3.canvas.solution.calls,
      lesson.phase3.canvas.tolerance,
    );

    if (!restored) {
      dispatch({
        type: 'RUN_FAIL',
        error: 'That drawing did not restore the flag yet. Check the prompt and try again.',
      });
      return;
    }

    awardPhaseXP();
    dispatch({ type: 'RUN_SUCCESS' });
  }

  function handleCompleteLesson(): void {
    const amount = calculateLessonXP(course.xp, lessonState.hintsUsed, lessonState.syntaxUnlocked);
    addXP(amount);
    setAwardedXP((current) => current + amount);
    dispatch({ type: 'COMPLETE_LESSON' });
  }

  if (pendingNarrative !== null) {
    return (
      <main className="min-h-screen bg-gray-900 text-white">
        <section className="h-screen" aria-label={`${lesson.title} story`}>
          <NarrativePlayer
            script={pendingNarrative}
            onComplete={handleNarrativeComplete}
            skippable={
              lessonState.currentPhase !== 1 || lessonState.phaseStatus !== 'narrative-intro'
            }
          />
        </section>
      </main>
    );
  }

  if (lessonState.currentPhase === 'complete') {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-6 bg-gray-900 p-6 text-center text-white">
        <p className="font-pixel text-xs text-yellow-300">Lesson complete</p>
        <h1 className="font-pixel text-lg text-green-300">{lesson.title}</h1>
        <p className="max-w-2xl font-pixel text-xs leading-relaxed text-gray-100">
          {lesson.phase3.celebration.message}
        </p>
        <p className="font-pixel text-xs text-yellow-300">XP earned this run: {awardedXP}</p>
        <button
          type="button"
          onClick={onReturnToMap}
          className="rounded border-2 border-green-300 bg-green-400 px-4 py-3 font-pixel text-xs text-gray-950 hover:bg-green-300"
        >
          Return to map
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-900 p-4 text-white">
      <header className="mb-4 flex flex-col gap-2">
        <p className="font-pixel text-xs text-yellow-300">
          {formatPhaseLabel(lessonState.currentPhase)}
        </p>
        <h1 className="font-pixel text-base text-green-300">{lesson.title}</h1>
        <p
          role="status"
          aria-live="polite"
          className="font-pixel text-xs leading-relaxed text-gray-200"
        >
          {getStatusMessage(lessonState.phaseStatus)}
        </p>
        <p className="font-pixel text-xs text-yellow-300">XP earned this run: {awardedXP}</p>
      </header>

      {lessonState.lastError !== null && (
        <section
          role="alert"
          aria-live="assertive"
          className="mb-4 rounded border-2 border-red-300 bg-red-950 p-3 font-pixel text-xs leading-relaxed text-red-100"
        >
          {lessonState.lastError}
        </section>
      )}

      {activeHint !== null && (
        <section className="mb-4">
          <button
            type="button"
            aria-expanded={hintOpen}
            onClick={handleShowHint}
            className="rounded border-2 border-yellow-300 bg-gray-950 px-3 py-2 font-pixel text-xs text-yellow-300 hover:bg-yellow-300 hover:text-gray-950"
          >
            Hint
          </button>
          {hintOpen && (
            <p className="mt-2 rounded border-2 border-yellow-300 bg-yellow-950 p-3 font-pixel text-xs leading-relaxed text-yellow-100">
              {activeHint}
            </p>
          )}
        </section>
      )}

      {lessonState.currentPhase === 1 && (
        <section className="grid gap-4 lg:grid-cols-[minmax(18rem,0.55fr)_minmax(0,1fr)]">
          <div className="rounded border-2 border-gray-700 bg-gray-950 p-4">
            <h2 className="mb-3 font-pixel text-sm text-yellow-300">
              {lesson.phase1.conceptIntro.title}
            </h2>
            <p className="mb-3 font-pixel text-xs leading-relaxed text-gray-200">
              {lesson.phase1.conceptIntro.body}
            </p>
            <pre className="overflow-auto rounded bg-gray-900 p-3 text-sm text-green-200">
              {lesson.phase1.conceptIntro.example}
            </pre>
            <p className="mt-4 font-pixel text-xs leading-relaxed text-white">
              {lesson.phase1.challenge.prompt}
            </p>
          </div>
          <section className="min-h-[540px]" aria-label="Phase 1 block editor">
            <BlockEditor
              phase={1}
              blockDefs={lesson.blocks}
              availableBlocks={lesson.phase1.challenge.availableBlocks}
              onCodeGenerated={handleBlockCodeGenerated}
              isRunning={isRunning}
            />
          </section>
        </section>
      )}

      {lessonState.currentPhase === 2 && (
        <section className="grid gap-4 lg:grid-cols-[minmax(18rem,0.55fr)_minmax(0,1fr)]">
          <div className="rounded border-2 border-gray-700 bg-gray-950 p-4">
            <h2 className="mb-3 font-pixel text-sm text-yellow-300">Flag pieces</h2>
            <p className="mb-4 font-pixel text-xs leading-relaxed text-white">
              {lesson.phase2.challenge.prompt}
            </p>
            <ul className="flex flex-col gap-3">
              {lesson.phase2.challenge.items.map((item) => (
                <li key={item.id} className="font-pixel text-xs text-gray-200">
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
          <section className="min-h-[540px]" aria-label="Phase 2 block editor">
            <BlockEditor
              phase={2}
              blockDefs={lesson.blocks}
              availableBlocks={lesson.phase2.challenge.availableBlocks}
              onCodeGenerated={handleBlockCodeGenerated}
              isRunning={isRunning}
            />
          </section>
        </section>
      )}

      {lessonState.currentPhase === 3 && lessonState.phaseStatus !== 'success' && (
        <section className="grid gap-4 xl:grid-cols-[minmax(20rem,0.75fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <p className="rounded border-2 border-gray-700 bg-gray-950 p-4 font-pixel text-xs leading-relaxed text-white">
              {lesson.phase3.prompt}
            </p>
            <CanvasRenderer
              ref={canvasRef}
              width={lesson.phase3.canvas.width}
              height={lesson.phase3.canvas.height}
              className="border-4 border-gray-950 bg-white"
            />
          </div>
          <section className="min-h-[560px]" aria-label="Phase 3 code editor">
            <EditorToggle
              activeView={editorView}
              onViewChange={setEditorView}
              failedAttempts={lessonState.attemptCount}
              fallbackAfterAttempts={lesson.phase3.fallbackAfterAttempts}
              syntaxEditorProps={{
                value: phase3Code,
                onChange: setPhase3Code,
                onRun: handlePhase3Run,
                isRunning,
                availableFunctions: lesson.phase3.canvas.availableFunctions,
                height: '460px',
              }}
              blockEditorProps={{
                blockDefs: lesson.blocks,
                availableBlocks: lesson.phase3.availableBlocks,
                onCodeGenerated: () => undefined,
                isRunning,
              }}
            />
          </section>
        </section>
      )}

      {lessonState.currentPhase === 3 && lessonState.phaseStatus === 'success' && (
        <section className="flex min-h-[26rem] flex-col items-center justify-center gap-4 rounded border-2 border-green-300 bg-gray-950 p-6 text-center">
          <p className="font-pixel text-xs text-green-300">The flag is restored.</p>
          <button
            type="button"
            onClick={handleCompleteLesson}
            className="rounded border-2 border-yellow-300 bg-yellow-300 px-4 py-3 font-pixel text-xs text-gray-950 hover:bg-yellow-200"
          >
            Celebrate restored flag
          </button>
        </section>
      )}
    </main>
  );
}

function normalizeCode(code: string): string {
  return code
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .join('\n');
}

function formatPhaseLabel(phase: 1 | 2 | 3): string {
  return `Phase ${phase.toString()}`;
}

function getStatusMessage(status: string): string {
  if (status === 'failed') {
    return 'Try again when you are ready.';
  }

  if (status === 'running') {
    return 'Running your code...';
  }

  if (status === 'success') {
    return 'Challenge solved.';
  }

  return 'Solve the challenge to continue.';
}
