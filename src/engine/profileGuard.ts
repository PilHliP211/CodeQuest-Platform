import type { LearnerProfile } from '@/types/profile';

export function isLearnerProfile(data: unknown): data is LearnerProfile {
  if (typeof data !== 'object' || data === null) return false;
  const record = data as Record<string, unknown>;
  return (
    typeof record.name === 'string' &&
    record.name.length > 0 &&
    typeof record.createdAt === 'string' &&
    !Number.isNaN(Date.parse(record.createdAt))
  );
}
