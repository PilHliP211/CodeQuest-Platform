import type { Lesson, NarrativeScene } from '@/types/content';
import type { LessonState } from '@/types/lessonState';

export function getPendingNarrative(
  lesson: Lesson,
  state: LessonState,
): readonly NarrativeScene[] | null {
  const { currentPhase, phaseStatus } = state;

  if (currentPhase === 1 && phaseStatus === 'narrative-intro') {
    return lesson.phase1.intro.scenes;
  }

  if (currentPhase === 1 && phaseStatus === 'narrative-outro') {
    return lesson.phase1.outro.scenes;
  }

  if (currentPhase === 2 && phaseStatus === 'narrative-intro') {
    return lesson.phase2.intro.scenes;
  }

  if (currentPhase === 2 && phaseStatus === 'narrative-outro') {
    return lesson.phase2.reveal.scenes;
  }

  if (currentPhase === 3 && phaseStatus === 'narrative-intro') {
    return lesson.phase3.intro.scenes;
  }

  return null;
}
