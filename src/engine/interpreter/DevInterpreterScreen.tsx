import { useState } from 'react';
import { execute, executeStep, formatErrorForDisplay, type ExecutionResult } from './interpreter';
import { loadDevInterpreterContent } from './devInterpreterContent';

// NOTE: Temporary E-09 dev harness. This route (/__dev/interpreter)
// should be removed or folded into LessonScreen once E-11 routes player
// code through the real lesson runner and E-10 provides canvas output.

const devContent = loadDevInterpreterContent();

interface HarnessRun {
  readonly result: ExecutionResult;
  readonly calls: readonly string[];
  readonly steps: readonly string[];
}

function formatArg(value: unknown): string {
  if (typeof value === 'string') {
    return `"${value}"`;
  }

  return String(value);
}

function formatCall(name: string, args: readonly unknown[]): string {
  return `${name}(${args.map(formatArg).join(', ')})`;
}

function createLoggingScope(
  functionNames: readonly string[],
  calls: string[],
): Record<string, unknown> {
  const scope: Record<string, unknown> = Object.create(null) as Record<string, unknown>;

  for (const name of functionNames) {
    scope[name] = (...args: unknown[]) => {
      calls.push(formatCall(name, args));
    };
  }

  return scope;
}

function runCode(code: string): HarnessRun {
  const calls: string[] = [];
  const result = execute(code, createLoggingScope(devContent.availableFunctions, calls));

  return {
    result,
    calls,
    steps: [],
  };
}

function runCodeStepByStep(code: string): HarnessRun {
  const calls: string[] = [];
  const steps: string[] = [];
  const generator = executeStep(code, createLoggingScope(devContent.availableFunctions, calls));
  let next = generator.next();

  while (next.done !== true) {
    steps.push(`Step ${(steps.length + 1).toString()}: ${next.value.fnName}`);
    next = generator.next();
  }

  return {
    result: next.value,
    calls,
    steps,
  };
}

export function DevInterpreterScreen(): React.ReactElement {
  const [code, setCode] = useState(devContent.initialCode);
  const [run, setRun] = useState<HarnessRun>(() => runCode(devContent.initialCode));

  const statusText = run.result.success
    ? 'Code ran safely. The call log shows what the renderer would receive.'
    : formatErrorForDisplay(run.result.error);

  return (
    <main className="flex min-h-screen flex-col gap-4 bg-gray-900 p-4 text-white">
      <header className="flex flex-col gap-2">
        <p className="font-pixel text-xs leading-relaxed text-yellow-300">
          Temporary E-09 dev harness - remove when E-10/E-11 wire real lesson execution
        </p>
        <h1 className="font-pixel text-sm text-green-300">{devContent.title}</h1>
        <p className="max-w-4xl font-pixel text-xs leading-relaxed text-gray-200">
          {devContent.prompt}
        </p>
      </header>

      <section className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(20rem,0.7fr)]">
        <div className="flex flex-col gap-3">
          <label htmlFor="dev-interpreter-code" className="font-pixel text-xs text-gray-200">
            Player code
          </label>
          <textarea
            id="dev-interpreter-code"
            value={code}
            onChange={(event) => {
              setCode(event.target.value);
            }}
            spellCheck={false}
            className="min-h-80 rounded border-4 border-gray-950 bg-gray-950 p-4 font-mono text-sm leading-relaxed text-green-100 outline-none focus:border-green-300"
          />
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => {
                setRun(runCode(code));
              }}
              className="rounded border-2 border-green-300 bg-green-400 px-4 py-3 font-pixel text-xs text-gray-950 hover:bg-green-300"
            >
              Run Code
            </button>
            <button
              type="button"
              onClick={() => {
                setRun(runCodeStepByStep(code));
              }}
              className="rounded border-2 border-cyan-300 bg-cyan-300 px-4 py-3 font-pixel text-xs text-gray-950 hover:bg-cyan-200"
            >
              Run Step Mode
            </button>
            <button
              type="button"
              onClick={() => {
                setCode(devContent.blockedCode);
                setRun(runCode(devContent.blockedCode));
              }}
              className="rounded border-2 border-yellow-300 bg-yellow-300 px-4 py-3 font-pixel text-xs text-gray-950 hover:bg-yellow-200"
            >
              Try Blocked Code
            </button>
          </div>
        </div>

        <aside className="flex flex-col gap-4">
          <section
            role="status"
            aria-live="polite"
            className="rounded border-2 border-gray-700 bg-gray-950 p-3 font-pixel text-xs leading-relaxed text-green-200"
          >
            <h2 className="mb-2 text-yellow-300">Result</h2>
            <p>{statusText}</p>
          </section>

          <section className="rounded border-2 border-gray-700 bg-gray-950 p-3 font-pixel text-xs leading-relaxed text-gray-200">
            <h2 className="mb-2 text-yellow-300">Available Functions</h2>
            <ul className="flex flex-col gap-2">
              {devContent.availableFunctions.map((name) => (
                <li key={name}>{name}</li>
              ))}
            </ul>
          </section>

          <section className="rounded border-2 border-gray-700 bg-gray-950 p-3 font-pixel text-xs leading-relaxed text-gray-200">
            <h2 className="mb-2 text-yellow-300">Call Log</h2>
            {run.calls.length === 0 ? (
              <p>No renderer calls yet.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {run.calls.map((call, index) => (
                  <li key={`${call}-${index.toString()}`}>{call}</li>
                ))}
              </ol>
            )}
          </section>

          <section className="rounded border-2 border-gray-700 bg-gray-950 p-3 font-pixel text-xs leading-relaxed text-gray-200">
            <h2 className="mb-2 text-yellow-300">Step Log</h2>
            {run.steps.length === 0 ? (
              <p>Use step mode to collect execution steps.</p>
            ) : (
              <ol className="flex flex-col gap-2">
                {run.steps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </section>
    </main>
  );
}
