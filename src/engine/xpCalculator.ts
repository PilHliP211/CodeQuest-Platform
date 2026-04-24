import type { XpConfig } from '@/types/content';

export function calculatePhaseXP(xpConfig: XpConfig, hintsUsed: number): number {
  return Math.max(0, xpConfig.phaseComplete + xpConfig.hintUsed * hintsUsed);
}

export function calculateLessonXP(
  xpConfig: XpConfig,
  hintsUsed: number,
  syntaxUnlocked: boolean,
): number {
  const syntaxBonus = syntaxUnlocked ? xpConfig.syntaxEditorUsed : 0;
  return Math.max(0, xpConfig.lessonComplete + xpConfig.hintUsed * hintsUsed + syntaxBonus);
}
