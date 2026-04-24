import type { NarrativeScene } from './content';

export type LessonPhase = 1 | 2 | 3 | 'complete';

export type PhaseStatus =
  | 'narrative-intro'
  | 'challenge'
  | 'running'
  | 'success'
  | 'narrative-outro'
  | 'failed';

export interface LessonState {
  lessonId: string;
  currentPhase: LessonPhase;
  phaseStatus: PhaseStatus;
  attemptCount: number;
  hintsUsed: number;
  syntaxUnlocked: boolean;
  lastError: string | null;
  pendingNarrative: readonly NarrativeScene[] | null;
}

export type LessonAction =
  | { type: 'START_LESSON'; lessonId: string }
  | { type: 'NARRATIVE_COMPLETE' }
  | { type: 'RUN_CODE' }
  | { type: 'RUN_SUCCESS' }
  | { type: 'RUN_FAIL'; error: string }
  | { type: 'SHOW_HINT' }
  | { type: 'NEXT_PHASE' }
  | { type: 'COMPLETE_LESSON' }
  | { type: 'EXIT_LESSON' };
