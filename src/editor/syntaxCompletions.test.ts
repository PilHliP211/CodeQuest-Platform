import { describe, expect, it } from 'vitest';
import { buildSyntaxCompletions } from './syntaxCompletions';
import type { AvailableFunction } from '@/types/content';

const fillBackground: AvailableFunction = {
  name: 'fillBackground',
  signature: 'fillBackground(color)',
  description: 'Fill the canvas with a solid color.',
  example: 'fillBackground("white")',
};

const drawCircle: AvailableFunction = {
  name: 'drawCircle',
  signature: 'drawCircle(x, y, radius, color)',
  description: 'Draw a filled circle.',
  example: 'drawCircle(150, 100, 60, "red")',
};

describe('buildSyntaxCompletions', () => {
  it('offers the learner exactly the lesson’s available functions', () => {
    const completions = buildSyntaxCompletions([fillBackground, drawCircle]);

    expect(completions.map((c) => c.label)).toEqual(['fillBackground', 'drawCircle']);
  });

  it('shows the signature as the suggestion detail', () => {
    const [completion] = buildSyntaxCompletions([fillBackground]);

    expect(completion?.detail).toBe('fillBackground(color)');
  });

  it('shows the description so learners see what the function does', () => {
    const [completion] = buildSyntaxCompletions([fillBackground]);

    expect(completion?.documentation).toBe('Fill the canvas with a solid color.');
  });

  it('inserts the function name followed by call parentheses', () => {
    const [completion] = buildSyntaxCompletions([drawCircle]);

    expect(completion?.insertText).toBe('drawCircle()');
  });

  it('returns no suggestions when the lesson exposes no functions', () => {
    expect(buildSyntaxCompletions([])).toEqual([]);
  });
});
