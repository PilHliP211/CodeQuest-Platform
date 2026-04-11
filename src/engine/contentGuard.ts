import type { Course } from '@/types/content';

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

export function isCourse(data: unknown): data is Course {
  if (!isNonNullObject(data)) return false;

  // Required string fields
  if (typeof data.id !== 'string' || data.id.length === 0) return false;
  if (typeof data.title !== 'string' || data.title.length === 0) return false;
  if (typeof data.description !== 'string') return false;
  if (typeof data.version !== 'string') return false;

  // map must be a non-null object with required fields
  if (!isNonNullObject(data.map)) return false;
  const map = data.map;
  if (typeof map.backgroundImage !== 'string') return false;
  if (typeof map.width !== 'number') return false;
  if (typeof map.height !== 'number') return false;
  if (typeof map.startNodeId !== 'string') return false;
  if (!Array.isArray(map.nodes)) return false;
  if (!Array.isArray(map.edges)) return false;

  // lessons must be a non-empty array
  if (!Array.isArray(data.lessons) || data.lessons.length === 0) return false;

  // xp must be a non-null object with number fields
  if (!isNonNullObject(data.xp)) return false;
  const xp = data.xp;
  if (typeof xp.phaseComplete !== 'number') return false;
  if (typeof xp.lessonComplete !== 'number') return false;
  if (typeof xp.hintUsed !== 'number') return false;
  if (typeof xp.syntaxEditorUsed !== 'number') return false;

  // villain and player must be non-null objects
  if (!isNonNullObject(data.villain)) return false;
  if (typeof data.villain.name !== 'string') return false;
  if (typeof data.villain.sprite !== 'string') return false;

  if (!isNonNullObject(data.player)) return false;
  if (typeof data.player.sprite !== 'string') return false;

  return true;
}
