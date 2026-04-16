import { describe, expect, it } from 'vitest';
import { createCompletionEntries } from './completionItems';
import type { AvailableFunction } from '@/types/content';

const availableFunctions: readonly AvailableFunction[] = [
  {
    name: 'fillBackground',
    signature: 'fillBackground(color: string)',
    description: 'Fill the entire canvas with a color',
    example: 'fillBackground("white")',
  },
  {
    name: 'drawCircle',
    signature: 'drawCircle(x: number, y: number, radius: number, color: string)',
    description: 'Draw a filled circle at position (x, y)',
    example: 'drawCircle(150, 100, 60, "red")',
  },
];

describe('createCompletionEntries', () => {
  it('creates learner-facing completions only for the lesson functions', () => {
    const entries = createCompletionEntries(availableFunctions);

    expect(entries).toEqual([
      {
        label: 'fillBackground',
        detail: 'fillBackground(color: string)',
        documentation: 'Fill the entire canvas with a color',
        insertText: 'fillBackground()',
      },
      {
        label: 'drawCircle',
        detail: 'drawCircle(x: number, y: number, radius: number, color: string)',
        documentation: 'Draw a filled circle at position (x, y)',
        insertText: 'drawCircle()',
      },
    ]);
    expect(entries.map((entry) => entry.label)).not.toContain('window');
    expect(entries.map((entry) => entry.label)).not.toContain('console');
  });
});
