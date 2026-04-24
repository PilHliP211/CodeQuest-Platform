import { describe, expect, it } from 'vitest';
import { getActiveHint, getCurrentPhaseHints } from './hintSelector';
import { testLesson } from '@/test/lessonFixture';

describe('getActiveHint', () => {
  const hints = [
    { afterAttempts: 2, text: 'First hint' },
    { afterAttempts: 4, text: 'Second hint' },
  ];

  it('returns no hint before a threshold is reached', () => {
    expect(getActiveHint(hints, 1)).toBeNull();
  });

  it('returns the reached hint at its threshold', () => {
    expect(getActiveHint(hints, 2)).toBe('First hint');
  });

  it('returns the highest reached hint', () => {
    expect(getActiveHint(hints, 5)).toBe('Second hint');
  });
});

describe('getCurrentPhaseHints', () => {
  it('reads hints from the active lesson phase', () => {
    expect(getCurrentPhaseHints(testLesson, 2)[0]?.text).toBe('Search before collecting.');
  });

  it('returns no hints after the lesson is complete', () => {
    expect(getCurrentPhaseHints(testLesson, 'complete')).toEqual([]);
  });
});
