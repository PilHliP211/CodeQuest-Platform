import { readStorage, writeStorage } from './storage';

export type LessonProgressRecord = Record<string, unknown> & {
  syntaxUnlocked?: boolean;
};

const XP_KEY = 'codequest:xp';

function progressKey(packId: string, lessonId: string): string {
  return `codequest:progress:${packId}:${lessonId}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isLessonProgressRecord(value: unknown): value is LessonProgressRecord {
  if (!isRecord(value)) {
    return false;
  }

  return value.syntaxUnlocked === undefined || typeof value.syntaxUnlocked === 'boolean';
}

export function loadSyntaxUnlocked(packId: string, lessonId: string): boolean {
  const progress = readStorage(progressKey(packId, lessonId), isLessonProgressRecord);
  return progress?.syntaxUnlocked === true;
}

export function saveSyntaxUnlocked(packId: string, lessonId: string): void {
  const key = progressKey(packId, lessonId);
  const existingProgress = readStorage(key, isLessonProgressRecord);

  writeStorage(key, {
    ...(existingProgress ?? {}),
    syntaxUnlocked: true,
  });
}

function isStoredXP(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function getTotalXP(): number {
  return readStorage(XP_KEY, isStoredXP) ?? 0;
}

export function addXP(amount: number): void {
  if (!Number.isFinite(amount)) {
    return;
  }

  writeStorage(XP_KEY, Math.max(0, getTotalXP() + amount));
}
