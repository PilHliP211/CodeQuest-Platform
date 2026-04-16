import { beforeEach, describe, expect, it } from 'vitest';
import { readStorage, writeStorage } from './storage';
import { loadSyntaxUnlocked, saveSyntaxUnlocked, type LessonProgressRecord } from './progressStore';

const progressKey = 'codequest:progress:flag-hunter:001-japan';

function isLessonProgressRecord(value: unknown): value is LessonProgressRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

describe('progressStore syntax unlocks', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('treats missing progress as locked', () => {
    expect(loadSyntaxUnlocked('flag-hunter', '001-japan')).toBe(false);
  });

  it('saves and reloads syntax unlock state for a lesson', () => {
    saveSyntaxUnlocked('flag-hunter', '001-japan');

    expect(loadSyntaxUnlocked('flag-hunter', '001-japan')).toBe(true);
  });

  it('preserves existing progress fields when syntax becomes unlocked', () => {
    writeStorage(progressKey, {
      phase1Complete: true,
      xpEarned: 20,
    });

    saveSyntaxUnlocked('flag-hunter', '001-japan');

    expect(readStorage(progressKey, isLessonProgressRecord)).toEqual({
      phase1Complete: true,
      xpEarned: 20,
      syntaxUnlocked: true,
    });
  });

  it('ignores corrupted syntax unlock values', () => {
    writeStorage(progressKey, {
      syntaxUnlocked: 'yes',
    });

    expect(loadSyntaxUnlocked('flag-hunter', '001-japan')).toBe(false);
  });
});
