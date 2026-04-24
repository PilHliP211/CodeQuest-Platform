import { describe, expect, it } from 'vitest';
import { calculateLessonXP, calculatePhaseXP } from './xpCalculator';
import type { XpConfig } from '@/types/content';

const xpConfig: XpConfig = {
  phaseComplete: 10,
  lessonComplete: 50,
  hintUsed: -5,
  syntaxEditorUsed: 5,
};

describe('calculatePhaseXP', () => {
  it('awards phase XP when no hints were used', () => {
    expect(calculatePhaseXP(xpConfig, 0)).toBe(10);
  });

  it('deducts hint penalties from phase XP', () => {
    expect(calculatePhaseXP(xpConfig, 1)).toBe(5);
  });

  it('never returns negative phase XP', () => {
    expect(calculatePhaseXP(xpConfig, 10)).toBe(0);
  });
});

describe('calculateLessonXP', () => {
  it('awards lesson XP with the syntax editor bonus after syntax unlock', () => {
    expect(calculateLessonXP(xpConfig, 0, true)).toBe(55);
  });

  it('deducts hint penalties from lesson XP', () => {
    expect(calculateLessonXP(xpConfig, 2, true)).toBe(45);
  });

  it('never returns negative lesson XP', () => {
    expect(calculateLessonXP(xpConfig, 20, false)).toBe(0);
  });
});
