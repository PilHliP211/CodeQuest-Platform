import type { RendererCall } from './rendererAPI';

export interface SolutionCall {
  fn: string;
  args: readonly (string | number)[];
}

export function evaluateSuccess(
  playerCalls: readonly RendererCall[],
  solution: readonly SolutionCall[],
  tolerance: number,
): boolean {
  if (playerCalls.length < solution.length) {
    return false;
  }

  const numericTolerance = Math.max(0, tolerance);
  let playerIndex = 0;

  for (const expected of solution) {
    let matched = false;

    while (playerIndex < playerCalls.length) {
      const actual = playerCalls[playerIndex];
      playerIndex += 1;

      if (actual !== undefined && callMatches(actual, expected, numericTolerance)) {
        matched = true;
        break;
      }
    }

    if (!matched) {
      return false;
    }
  }

  return true;
}

function callMatches(actual: RendererCall, expected: SolutionCall, tolerance: number): boolean {
  if (actual.fn !== expected.fn) {
    return false;
  }

  if (actual.args.length !== expected.args.length) {
    return false;
  }

  for (let index = 0; index < expected.args.length; index += 1) {
    const expectedArg = expected.args[index];
    const actualArg = actual.args[index];

    if (typeof expectedArg === 'string' && typeof actualArg === 'string') {
      if (expectedArg.toLowerCase() !== actualArg.toLowerCase()) {
        return false;
      }
    } else if (typeof expectedArg === 'number' && typeof actualArg === 'number') {
      if (Math.abs(actualArg - expectedArg) > tolerance) {
        return false;
      }
    } else {
      return false;
    }
  }

  return true;
}
