import type { LessonAction, LessonPhase, LessonState } from '@/types/lessonState';

type ActiveLessonPhase = 1 | 2 | 3;

export function createInitialState(lessonId: string): LessonState {
  return {
    lessonId,
    currentPhase: 1,
    phaseStatus: 'narrative-intro',
    attemptCount: 0,
    hintsUsed: 0,
    syntaxUnlocked: false,
    lastError: null,
    pendingNarrative: null,
  };
}

export function lessonReducer(state: LessonState, action: LessonAction): LessonState {
  switch (action.type) {
    case 'START_LESSON':
      return createInitialState(action.lessonId);

    case 'NARRATIVE_COMPLETE':
      return completeNarrative(state);

    case 'RUN_CODE':
      if (state.phaseStatus !== 'challenge' && state.phaseStatus !== 'failed') {
        return state;
      }

      return { ...state, phaseStatus: 'running', lastError: null };

    case 'RUN_SUCCESS':
      if (state.phaseStatus !== 'running' || state.currentPhase === 'complete') {
        return state;
      }

      if (state.currentPhase === 3) {
        return { ...state, phaseStatus: 'success', lastError: null };
      }

      return {
        ...state,
        phaseStatus: 'narrative-outro',
        syntaxUnlocked: state.currentPhase === 2 ? true : state.syntaxUnlocked,
        lastError: null,
      };

    case 'RUN_FAIL':
      if (state.phaseStatus !== 'running') {
        return state;
      }

      return {
        ...state,
        phaseStatus: 'failed',
        attemptCount: state.attemptCount + 1,
        lastError: action.error,
      };

    case 'SHOW_HINT':
      return { ...state, hintsUsed: state.hintsUsed + 1 };

    case 'NEXT_PHASE':
      return advanceToNextPhase(state);

    case 'COMPLETE_LESSON':
      if (state.currentPhase !== 3 || state.phaseStatus !== 'success') {
        return state;
      }

      return {
        ...state,
        currentPhase: 'complete',
        phaseStatus: 'success',
        attemptCount: 0,
        lastError: null,
        pendingNarrative: null,
      };

    case 'EXIT_LESSON':
      return createInitialState('');
  }
}

function completeNarrative(state: LessonState): LessonState {
  if (state.phaseStatus === 'narrative-intro') {
    return { ...state, phaseStatus: 'challenge', pendingNarrative: null };
  }

  if (state.phaseStatus === 'narrative-outro') {
    return advanceToNextPhase(state);
  }

  return state;
}

function advanceToNextPhase(state: LessonState): LessonState {
  const nextPhase = getNextPhase(state.currentPhase);
  if (nextPhase === null) {
    return state;
  }

  return {
    ...state,
    currentPhase: nextPhase,
    phaseStatus: 'narrative-intro',
    attemptCount: 0,
    lastError: null,
    pendingNarrative: null,
  };
}

function getNextPhase(phase: LessonPhase): ActiveLessonPhase | null {
  if (phase === 1) {
    return 2;
  }

  if (phase === 2) {
    return 3;
  }

  return null;
}
