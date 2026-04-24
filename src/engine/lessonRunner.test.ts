import { describe, expect, it } from 'vitest';
import { createInitialState, lessonReducer } from './lessonRunner';
import type { LessonState } from '@/types/lessonState';

function challengeState(phase: 1 | 2 | 3 = 1): LessonState {
  return {
    ...createInitialState('001-japan'),
    currentPhase: phase,
    phaseStatus: 'challenge',
  };
}

function runningState(phase: 1 | 2 | 3 = 1): LessonState {
  return {
    ...challengeState(phase),
    phaseStatus: 'running',
  };
}

describe('lessonReducer', () => {
  it('starts a lesson at the phase 1 intro', () => {
    expect(createInitialState('001-japan')).toMatchObject({
      lessonId: '001-japan',
      currentPhase: 1,
      phaseStatus: 'narrative-intro',
      attemptCount: 0,
    });
  });

  it('opens the phase challenge after the intro narrative finishes', () => {
    const state = createInitialState('001-japan');

    expect(lessonReducer(state, { type: 'NARRATIVE_COMPLETE' })).toMatchObject({
      currentPhase: 1,
      phaseStatus: 'challenge',
    });
  });

  it('marks code as running from a challenge', () => {
    const state = challengeState();

    expect(lessonReducer(state, { type: 'RUN_CODE' })).toMatchObject({
      phaseStatus: 'running',
      lastError: null,
    });
  });

  it('records a failed run with the next attempt count', () => {
    const state = runningState();

    expect(lessonReducer(state, { type: 'RUN_FAIL', error: 'Try again.' })).toMatchObject({
      phaseStatus: 'failed',
      attemptCount: 1,
      lastError: 'Try again.',
    });
  });

  it('counts a viewed hint', () => {
    const state = challengeState();

    expect(lessonReducer(state, { type: 'SHOW_HINT' }).hintsUsed).toBe(1);
  });

  it('plays the phase outro after a phase 1 solution succeeds', () => {
    const state = runningState(1);

    expect(lessonReducer(state, { type: 'RUN_SUCCESS' })).toMatchObject({
      currentPhase: 1,
      phaseStatus: 'narrative-outro',
      syntaxUnlocked: false,
    });
  });

  it('advances to phase 2 after the phase 1 outro finishes', () => {
    const state: LessonState = {
      ...runningState(1),
      phaseStatus: 'narrative-outro',
      attemptCount: 2,
      lastError: 'Previous failure.',
    };

    expect(lessonReducer(state, { type: 'NARRATIVE_COMPLETE' })).toMatchObject({
      currentPhase: 2,
      phaseStatus: 'narrative-intro',
      attemptCount: 0,
      lastError: null,
    });
  });

  it('unlocks syntax after the phase 2 solution succeeds', () => {
    const state = runningState(2);

    expect(lessonReducer(state, { type: 'RUN_SUCCESS' })).toMatchObject({
      currentPhase: 2,
      phaseStatus: 'narrative-outro',
      syntaxUnlocked: true,
    });
  });

  it('marks phase 3 success before completing the lesson', () => {
    const state = runningState(3);

    expect(lessonReducer(state, { type: 'RUN_SUCCESS' })).toMatchObject({
      currentPhase: 3,
      phaseStatus: 'success',
    });
  });

  it('sets the lesson complete after phase 3 success', () => {
    const state: LessonState = {
      ...runningState(3),
      phaseStatus: 'success',
    };

    expect(lessonReducer(state, { type: 'COMPLETE_LESSON' })).toMatchObject({
      currentPhase: 'complete',
      phaseStatus: 'success',
      attemptCount: 0,
    });
  });

  it('ignores a run success while the player is not running code', () => {
    const state = challengeState();

    expect(lessonReducer(state, { type: 'RUN_SUCCESS' })).toBe(state);
  });

  it('ignores lesson completion before phase 3 has succeeded', () => {
    const state = challengeState(1);

    expect(lessonReducer(state, { type: 'COMPLETE_LESSON' })).toBe(state);
  });
});
