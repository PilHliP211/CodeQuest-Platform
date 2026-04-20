import { describe, expect, it } from 'vitest';
import type { RendererCall } from './rendererAPI';
import { evaluateSuccess, type SolutionCall } from './successEvaluator';

const solution: readonly SolutionCall[] = [
  { fn: 'fillBackground', args: ['white'] },
  { fn: 'drawCircle', args: [150, 100, 60, 'red'] },
];

describe('evaluateSuccess', () => {
  it('accepts the exact solution call sequence', () => {
    const playerCalls: readonly RendererCall[] = [
      { fn: 'fillBackground', args: ['white'] },
      { fn: 'drawCircle', args: [150, 100, 60, 'red'] },
    ];

    expect(evaluateSuccess(playerCalls, solution, 0)).toBe(true);
  });

  it('accepts numeric drawing differences within tolerance', () => {
    const playerCalls: readonly RendererCall[] = [
      { fn: 'fillBackground', args: ['white'] },
      { fn: 'drawCircle', args: [148, 101, 59, 'red'] },
    ];

    expect(evaluateSuccess(playerCalls, solution, 2)).toBe(true);
  });

  it('rejects numeric drawing differences outside tolerance', () => {
    const playerCalls: readonly RendererCall[] = [
      { fn: 'fillBackground', args: ['white'] },
      { fn: 'drawCircle', args: [145, 100, 60, 'red'] },
    ];

    expect(evaluateSuccess(playerCalls, solution, 2)).toBe(false);
  });

  it('matches colors case-insensitively but rejects the wrong color', () => {
    const caseOnlyDifference: readonly RendererCall[] = [
      { fn: 'fillBackground', args: ['WHITE'] },
      { fn: 'drawCircle', args: [150, 100, 60, 'Red'] },
    ];
    const wrongColor: readonly RendererCall[] = [
      { fn: 'fillBackground', args: ['white'] },
      { fn: 'drawCircle', args: [150, 100, 60, 'blue'] },
    ];

    expect(evaluateSuccess(caseOnlyDifference, solution, 0)).toBe(true);
    expect(evaluateSuccess(wrongColor, solution, 0)).toBe(false);
  });

  it('rejects a drawing that has fewer calls than the solution', () => {
    const playerCalls: readonly RendererCall[] = [{ fn: 'fillBackground', args: ['white'] }];

    expect(evaluateSuccess(playerCalls, solution, 0)).toBe(false);
  });

  it('allows extra player calls after the required solution calls', () => {
    const playerCalls: readonly RendererCall[] = [
      { fn: 'fillBackground', args: ['white'] },
      { fn: 'drawCircle', args: [150, 100, 60, 'red'] },
      { fn: 'drawRect', args: [0, 0, 10, 10, 'white'] },
    ];

    expect(evaluateSuccess(playerCalls, solution, 0)).toBe(true);
  });

  it('allows extra player calls between required solution calls', () => {
    const playerCalls: readonly RendererCall[] = [
      { fn: 'fillBackground', args: ['white'] },
      { fn: 'drawRect', args: [0, 0, 10, 10, 'white'] },
      { fn: 'drawCircle', args: [150, 100, 60, 'red'] },
    ];

    expect(evaluateSuccess(playerCalls, solution, 0)).toBe(true);
  });

  it('rejects calls that appear in the wrong order', () => {
    const playerCalls: readonly RendererCall[] = [
      { fn: 'drawCircle', args: [150, 100, 60, 'red'] },
      { fn: 'fillBackground', args: ['white'] },
    ];

    expect(evaluateSuccess(playerCalls, solution, 0)).toBe(false);
  });

  it('rejects the wrong drawing function name', () => {
    const playerCalls: readonly RendererCall[] = [
      { fn: 'fillBackground', args: ['white'] },
      { fn: 'drawRect', args: [150, 100, 60, 60, 'red'] },
    ];

    expect(evaluateSuccess(playerCalls, solution, 0)).toBe(false);
  });
});
