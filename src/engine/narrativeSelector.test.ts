import { describe, expect, it } from 'vitest';
import { getPendingNarrative } from './narrativeSelector';
import { createInitialState } from './lessonRunner';
import { testLesson } from '@/test/lessonFixture';
import type { LessonState } from '@/types/lessonState';

describe('getPendingNarrative', () => {
  it('selects the phase 1 intro narrative at lesson start', () => {
    expect(
      getPendingNarrative(testLesson, createInitialState(testLesson.id))?.[0]?.dialogue[0]?.text,
    ).toBe('Phase 1 intro');
  });

  it('selects the phase 2 reveal narrative after phase 2 success', () => {
    const state: LessonState = {
      ...createInitialState(testLesson.id),
      currentPhase: 2,
      phaseStatus: 'narrative-outro',
    };

    expect(getPendingNarrative(testLesson, state)?.[0]?.dialogue[0]?.text).toBe('Phase 2 reveal');
  });

  it('returns no narrative during a challenge', () => {
    const state: LessonState = {
      ...createInitialState(testLesson.id),
      phaseStatus: 'challenge',
    };

    expect(getPendingNarrative(testLesson, state)).toBeNull();
  });
});
