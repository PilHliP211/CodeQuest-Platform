import { useRef, useState } from 'react';
import { executeStep, formatErrorForDisplay, type ExecutionResult } from '@/engine/interpreter';
import { CanvasRenderer, type CanvasRendererHandle } from '@/renderer/CanvasRenderer';
import { animateDrawing, type AnimationHandle } from '@/renderer/animateDrawing';
import {
  buildRendererScope,
  createRendererAPI,
  type RendererAPI,
  type RendererCall,
} from '@/renderer/rendererAPI';
import { evaluateSuccess } from '@/renderer/successEvaluator';
import { loadDevCanvasContent } from './devCanvasContent';

// NOTE: Temporary E-10 dev harness. This route (/__dev/canvas)
// should be removed or folded into LessonScreen once E-11 routes
// Phase 3 player code through the real lesson runner.

const devContent = loadDevCanvasContent();

function isStringOrNumber(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}

function appendRecordedCall(calls: RendererCall[], fn: string, args: readonly unknown[]): void {
  if (args.every(isStringOrNumber)) {
    calls.push({ fn, args: [...args] });
  }
}

function createRecordingRendererAPI(calls: RendererCall[]): RendererAPI {
  return {
    fillBackground(color) {
      appendRecordedCall(calls, 'fillBackground', [color]);
    },
    drawRect(x, y, width, height, color) {
      appendRecordedCall(calls, 'drawRect', [x, y, width, height, color]);
    },
    drawCircle(x, y, radius, color) {
      appendRecordedCall(calls, 'drawCircle', [x, y, radius, color]);
    },
    drawStripe(x, y, width, height, color, angle) {
      const args =
        angle === undefined ? [x, y, width, height, color] : [x, y, width, height, color, angle];
      appendRecordedCall(calls, 'drawStripe', args);
    },
    drawTriangle(x1, y1, x2, y2, x3, y3, color) {
      appendRecordedCall(calls, 'drawTriangle', [x1, y1, x2, y2, x3, y3, color]);
    },
    getCallLog() {
      return calls.map((call) => ({ fn: call.fn, args: [...call.args] }));
    },
    clearCallLog() {
      calls.length = 0;
    },
    reset() {
      calls.length = 0;
    },
  };
}

function replayRendererCall(api: RendererAPI, call: RendererCall): void {
  switch (call.fn) {
    case 'fillBackground':
      if (call.args.length === 1 && typeof call.args[0] === 'string') {
        api.fillBackground(call.args[0]);
      }
      return;
    case 'drawRect':
      if (
        call.args.length === 5 &&
        typeof call.args[0] === 'number' &&
        typeof call.args[1] === 'number' &&
        typeof call.args[2] === 'number' &&
        typeof call.args[3] === 'number' &&
        typeof call.args[4] === 'string'
      ) {
        api.drawRect(call.args[0], call.args[1], call.args[2], call.args[3], call.args[4]);
      }
      return;
    case 'drawCircle':
      if (
        call.args.length === 4 &&
        typeof call.args[0] === 'number' &&
        typeof call.args[1] === 'number' &&
        typeof call.args[2] === 'number' &&
        typeof call.args[3] === 'string'
      ) {
        api.drawCircle(call.args[0], call.args[1], call.args[2], call.args[3]);
      }
      return;
    case 'drawStripe':
      if (
        call.args.length === 5 &&
        typeof call.args[0] === 'number' &&
        typeof call.args[1] === 'number' &&
        typeof call.args[2] === 'number' &&
        typeof call.args[3] === 'number' &&
        typeof call.args[4] === 'string'
      ) {
        api.drawStripe(call.args[0], call.args[1], call.args[2], call.args[3], call.args[4]);
      }

      if (
        call.args.length === 6 &&
        typeof call.args[0] === 'number' &&
        typeof call.args[1] === 'number' &&
        typeof call.args[2] === 'number' &&
        typeof call.args[3] === 'number' &&
        typeof call.args[4] === 'string' &&
        typeof call.args[5] === 'number'
      ) {
        api.drawStripe(
          call.args[0],
          call.args[1],
          call.args[2],
          call.args[3],
          call.args[4],
          call.args[5],
        );
      }
      return;
    case 'drawTriangle':
      if (
        call.args.length === 7 &&
        typeof call.args[0] === 'number' &&
        typeof call.args[1] === 'number' &&
        typeof call.args[2] === 'number' &&
        typeof call.args[3] === 'number' &&
        typeof call.args[4] === 'number' &&
        typeof call.args[5] === 'number' &&
        typeof call.args[6] === 'string'
      ) {
        api.drawTriangle(
          call.args[0],
          call.args[1],
          call.args[2],
          call.args[3],
          call.args[4],
          call.args[5],
          call.args[6],
        );
      }
      return;
    default:
      return;
  }
}

function collectRendererCalls(code: string): {
  result: ExecutionResult;
  calls: readonly RendererCall[];
} {
  const calls: RendererCall[] = [];
  const recordingApi = createRecordingRendererAPI(calls);
  const scope = buildRendererScope(recordingApi, devContent.canvas.availableFunctions);
  const generator = executeStep(code, scope);
  let next = generator.next();

  while (next.done !== true) {
    next = generator.next();
  }

  return {
    result: next.value,
    calls: recordingApi.getCallLog(),
  };
}

function callLabel(call: RendererCall): string {
  return `${call.fn}(${call.args.map(String).join(', ')})`;
}

export function DevCanvasScreen(): React.ReactElement {
  const canvasRef = useRef<CanvasRendererHandle>(null);
  const animationRef = useRef<AnimationHandle | null>(null);
  const rendererApiRef = useRef<RendererAPI | null>(null);
  const runIdRef = useRef(0);
  const [code, setCode] = useState(devContent.initialCode);
  const [callLog, setCallLog] = useState<readonly RendererCall[]>([]);
  const [statusText, setStatusText] = useState('Run the code to restore the flag.');
  const [isRunning, setIsRunning] = useState(false);

  function getRendererAPI(): RendererAPI {
    const renderer = canvasRef.current;
    if (renderer === null) {
      throw new Error('Canvas renderer is not ready.');
    }

    const api = createRendererAPI(renderer.getContext());
    rendererApiRef.current = api;
    return api;
  }

  function handleReset(): void {
    runIdRef.current += 1;
    animationRef.current?.cancel();
    animationRef.current = null;
    setIsRunning(false);

    const renderer = canvasRef.current;
    if (rendererApiRef.current !== null) {
      rendererApiRef.current.reset();
    } else if (renderer !== null) {
      rendererApiRef.current = createRendererAPI(renderer.getContext());
      rendererApiRef.current.reset();
    }

    setCallLog([]);
    setStatusText('Canvas reset. Run the code again when ready.');
  }

  function handleRun(): void {
    const runId = runIdRef.current + 1;
    runIdRef.current = runId;
    animationRef.current?.cancel();

    const api = getRendererAPI();
    api.reset();
    setCallLog([]);

    const collected = collectRendererCalls(code);
    if (!collected.result.success) {
      setIsRunning(false);
      setStatusText(formatErrorForDisplay(collected.result.error));
      return;
    }

    const steps = collected.calls.map((call) => (): void => {
      replayRendererCall(api, call);
      setCallLog(api.getCallLog());
    });

    setIsRunning(true);
    setStatusText('Drawing the flag one step at a time...');

    animationRef.current = animateDrawing(steps, 150, () => {
      if (runIdRef.current !== runId) {
        return;
      }

      const restored = evaluateSuccess(
        api.getCallLog(),
        devContent.canvas.solution.calls,
        devContent.canvas.tolerance,
      );
      setCallLog(api.getCallLog());
      setIsRunning(false);
      setStatusText(
        restored
          ? 'Flag restored. The solution calls matched.'
          : 'That drawing did not restore the flag yet.',
      );
    });
  }

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-gray-900 p-4 text-white">
      <header className="flex flex-col gap-2">
        <p className="font-pixel text-xs leading-relaxed text-yellow-300">
          Temporary E-10 dev harness - remove when E-11 wires LessonScreen Phase 3
        </p>
        <h1 className="font-pixel text-sm text-green-300">{devContent.title}</h1>
        <p className="max-w-4xl font-pixel text-xs leading-relaxed text-gray-200">
          {devContent.prompt}
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,0.8fr)]">
        <div className="flex flex-col gap-3">
          <label htmlFor="dev-canvas-code" className="font-pixel text-xs text-gray-200">
            Player code
          </label>
          <textarea
            id="dev-canvas-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
            }}
            spellCheck={false}
            className="min-h-64 rounded border-4 border-gray-950 bg-gray-950 p-4 font-mono text-sm leading-relaxed text-green-100 outline-none focus:border-green-300"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleRun}
              disabled={isRunning}
              className="rounded border-2 border-green-300 bg-green-400 px-4 py-3 font-pixel text-xs text-gray-950 hover:bg-green-300 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              Run Code
            </button>
            <button
              type="button"
              onClick={() => {
                setCode(devContent.solutionCode);
              }}
              disabled={isRunning}
              className="rounded border-2 border-cyan-300 bg-cyan-300 px-4 py-3 font-pixel text-xs text-gray-950 hover:bg-cyan-200 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              Load Solution
            </button>
            <button
              type="button"
              onClick={() => {
                setCode(devContent.wrongCode);
              }}
              disabled={isRunning}
              className="rounded border-2 border-red-300 bg-red-300 px-4 py-3 font-pixel text-xs text-gray-950 hover:bg-red-200 disabled:cursor-not-allowed disabled:bg-gray-500"
            >
              Try Wrong Code
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <section className="rounded border-2 border-gray-700 bg-gray-950 p-4">
            <CanvasRenderer
              ref={canvasRef}
              width={devContent.canvas.width}
              height={devContent.canvas.height}
              onReset={handleReset}
              className="border-4 border-gray-800 bg-white"
            />
          </section>

          <section
            role="status"
            aria-live="polite"
            className="rounded border-2 border-gray-700 bg-gray-950 p-3 font-pixel text-xs leading-relaxed text-green-200"
          >
            <p>{statusText}</p>
          </section>

          <section className="rounded border-2 border-gray-700 bg-gray-950 p-3 font-pixel text-xs leading-relaxed text-gray-200">
            <h2 className="mb-2 text-yellow-300">Call Log</h2>
            {callLog.length === 0 ? (
              <p>No renderer calls yet.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {callLog.map((call, index) => (
                  <li key={`${call.fn}-${index.toString()}`}>{callLabel(call)}</li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}
