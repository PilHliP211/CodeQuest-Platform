import fc from 'fast-check';
import { describe, expect, it, vi } from 'vitest';
import {
  execute,
  executeStep,
  formatErrorForDisplay,
  type ExecutionResult,
  type ExecutionStep,
  type PlayerFriendlyError,
} from './interpreter';

const identifierStartChars = [
  'a',
  'b',
  'c',
  'd',
  'e',
  'f',
  'g',
  'h',
  'i',
  'j',
  'k',
  'l',
  'm',
  'n',
  'o',
  'p',
  'q',
  'r',
  's',
  't',
  'u',
  'v',
  'w',
  'x',
  'y',
  'z',
  '_',
] as const;
const identifierPartChars = [...identifierStartChars, '0', '1', '2', '3', '4', '5'] as const;
const reservedWords = new Set([
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'export',
  'extends',
  'finally',
  'for',
  'function',
  'if',
  'import',
  'in',
  'instanceof',
  'let',
  'new',
  'return',
  'super',
  'switch',
  'this',
  'throw',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
]);
const allowedScope: Record<string, unknown> = {
  fillBackground: () => undefined,
  drawCircle: () => undefined,
};
const allowedNames = new Set(Object.keys(allowedScope));

function expectSuccess(result: ExecutionResult): void {
  expect(result.success).toBe(true);
}

function expectFailure(result: ExecutionResult): PlayerFriendlyError {
  expect(result.success).toBe(false);

  if (result.success) {
    throw new Error('Expected execution to fail.');
  }

  return result.error;
}

function collectSteps(generator: Generator<ExecutionStep, ExecutionResult, void>): {
  steps: ExecutionStep[];
  result: ExecutionResult;
} {
  const steps: ExecutionStep[] = [];
  let next = generator.next();

  while (next.done !== true) {
    steps.push(next.value);
    next = generator.next();
  }

  return {
    steps,
    result: next.value,
  };
}

describe('execute', () => {
  it('calls a single available function', () => {
    const draw = vi.fn();

    const result = execute('draw()', { draw });

    expectSuccess(result);
    expect(draw).toHaveBeenCalledOnce();
  });

  it('calls multiple available functions in order', () => {
    const log: string[] = [];
    const scope: Record<string, unknown> = {
      a: () => {
        log.push('a');
      },
      b: () => {
        log.push('b');
      },
      c: () => {
        log.push('c');
      },
    };

    const result = execute('a()\nb()\nc()', scope);

    expectSuccess(result);
    expect(log).toEqual(['a', 'b', 'c']);
  });

  it('passes string and numeric arguments to available functions', () => {
    const drawCircle = vi.fn();

    const result = execute('drawCircle(150, 100, 60, "red")', { drawCircle });

    expectSuccess(result);
    expect(drawCircle).toHaveBeenCalledWith(150, 100, 60, 'red');
  });

  it('uses variables created with let', () => {
    const fillBackground = vi.fn();

    const result = execute('let color = "white"\nfillBackground(color)', { fillBackground });

    expectSuccess(result);
    expect(fillBackground).toHaveBeenCalledWith('white');
  });

  it('runs a for loop the requested number of times', () => {
    const drawCircle = vi.fn();

    const result = execute('for (let i = 0; i < 3; i++) { drawCircle(i, 0, 1, "red") }', {
      drawCircle,
    });

    expectSuccess(result);
    expect(drawCircle).toHaveBeenCalledTimes(3);
    expect(drawCircle).toHaveBeenNthCalledWith(1, 0, 0, 1, 'red');
    expect(drawCircle).toHaveBeenNthCalledWith(3, 2, 0, 1, 'red');
  });

  it('runs only the matching if branch', () => {
    const yes = vi.fn();
    const no = vi.fn();

    const result = execute('if (1 > 0) { yes() } else { no() }', { yes, no });

    expectSuccess(result);
    expect(yes).toHaveBeenCalledOnce();
    expect(no).not.toHaveBeenCalled();
  });

  it('runs functions declared by the player', () => {
    const draw = vi.fn();

    const result = execute('function go() { draw() }\ngo()\ngo()', { draw });

    expectSuccess(result);
    expect(draw).toHaveBeenCalledTimes(2);
  });

  it('does not mutate the caller scope object', () => {
    const draw = vi.fn();
    const scope: Record<string, unknown> = { draw };

    const result = execute('let x = 3\ndraw(x)', scope);

    expectSuccess(result);
    expect(scope).toEqual({ draw });
  });

  it('returns success for empty code', () => {
    expectSuccess(execute('', {}));
  });
});

describe('execute sandbox boundary', () => {
  it('rejects forbidden browser globals', () => {
    const blockedPrograms = [
      'window.alert("x")',
      'document.write("x")',
      'localStorage.getItem("x")',
      'fetch("/secret")',
      'eval("1+1")',
      'Function("return 1")',
    ];

    for (const code of blockedPrograms) {
      const error = expectFailure(execute(code, {}));
      expect(error.message).not.toContain('ReferenceError');
    }
  });

  it('rejects member access even on variables the player created', () => {
    const error = expectFailure(execute('let color = "red"\ncolor.constructor', {}));

    expect(error.message).toContain('Dot access');
  });

  it('rejects var and const declarations', () => {
    expect(expectFailure(execute('var x = 1', {})).message).toContain('Use');
    expect(expectFailure(execute('const x = 1', {})).message).toContain('Use');
  });

  it('rejects import and export statements', () => {
    expect(expectFailure(execute('import x from "y"', {})).message).toContain('Imports');
    expect(expectFailure(execute('export const x = 1', {})).message).toContain('Imports');
  });
});

describe('execute errors', () => {
  it('returns a friendly syntax error with a line number', () => {
    const error = expectFailure(execute('let color = (', allowedScope));

    expect(error.message).toContain('Syntax error');
    expect(error.line).toBe(1);
    expect(error.message).not.toContain('SyntaxError');
    expect(error.message).not.toContain('at ');
  });

  it('returns a friendly message when a function is not available', () => {
    const error = expectFailure(execute('unknownFn()', {}));

    expect(error.message).toContain('unknownFn');
    expect(error.message).toContain('available functions');
  });

  it('returns a friendly message when a variable was not created', () => {
    const error = expectFailure(execute('drawCircle(size, 0, 1, "red")', allowedScope));

    expect(error.message).toContain('size');
    expect(error.message).toContain('let');
  });

  it('stops loops that run too many times', () => {
    const error = expectFailure(execute('for (let i = 0; i < 100000; i++) {}', {}));

    expect(error.message).toContain('circles too many times');
  });

  it('formats display errors with the line prefix when present', () => {
    expect(formatErrorForDisplay({ line: 3, message: 'Check your code.' })).toBe(
      'Line 3: Check your code.',
    );
    expect(formatErrorForDisplay({ message: 'Check your code.' })).toBe('Check your code.');
  });
});

describe('executeStep', () => {
  it('yields each available function call in execution order', () => {
    const log: string[] = [];
    const scope: Record<string, unknown> = {
      fillBackground: (color: unknown) => {
        log.push(`fill:${String(color)}`);
      },
      drawCircle: (x: unknown) => {
        log.push(`circle:${String(x)}`);
      },
    };

    const { steps, result } = collectSteps(
      executeStep(
        'fillBackground("white")\nfor (let i = 0; i < 2; i++) { drawCircle(i, 0, 1, "red") }',
        scope,
      ),
    );

    expectSuccess(result);
    expect(steps.map((step) => step.fnName)).toEqual([
      'fillBackground',
      'drawCircle',
      'drawCircle',
    ]);
    expect(log).toEqual(['fill:white', 'circle:0', 'circle:1']);
  });

  it('returns a friendly error result when step mode cannot parse the code', () => {
    const { steps, result } = collectSteps(executeStep('let x = (', allowedScope));
    const error = expectFailure(result);

    expect(steps).toEqual([]);
    expect(error.message).toContain('Syntax error');
  });
});

describe('execute sandbox invariants', () => {
  const identifierArbitrary = fc
    .tuple(
      fc.constantFrom(...identifierStartChars),
      fc.array(fc.constantFrom(...identifierPartChars), { maxLength: 8 }),
    )
    .map(([first, rest]) => `${first}${rest.join('')}`)
    .filter((identifier) => !allowedNames.has(identifier) && !reservedWords.has(identifier));

  it('rejects every generated identifier outside the allowlist', () => {
    fc.assert(
      fc.property(identifierArbitrary, (identifier) => {
        const result = execute(`${identifier}()`, allowedScope);

        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.message).toContain(identifier);
        }
      }),
      { numRuns: 200 },
    );
  });

  it('rejects generated programs containing disallowed statement forms', () => {
    const blockedProgramArbitrary = fc.constantFrom(
      'var x = 1',
      'const x = 1',
      'while (true) {}',
      'class Secret {}',
      'new Date()',
      'delete x',
      'with ({}) {}',
    );

    fc.assert(
      fc.property(blockedProgramArbitrary, (code) => {
        const result = execute(code, allowedScope);

        expect(result.success).toBe(false);
      }),
      { numRuns: 200 },
    );
  });
});
