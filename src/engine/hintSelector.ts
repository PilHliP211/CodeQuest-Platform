import type { Hint, Lesson } from '@/types/content';
import type { LessonPhase } from '@/types/lessonState';

export function getActiveHint(hints: readonly Hint[], attemptCount: number): string | null {
  let activeHint: Hint | null = null;

  for (const hint of hints) {
    if (
      attemptCount >= hint.afterAttempts &&
      (activeHint === null || hint.afterAttempts > activeHint.afterAttempts)
    ) {
      activeHint = hint;
    }
  }

  return activeHint?.text ?? null;
}

export function getCurrentPhaseHints(lesson: Lesson, phase: LessonPhase): readonly Hint[] {
  if (phase === 1) {
    return lesson.phase1.challenge.hints;
  }

  if (phase === 2) {
    return lesson.phase2.challenge.hints;
  }

  if (phase === 3) {
    return lesson.phase3.hints;
  }

  return [];
}
