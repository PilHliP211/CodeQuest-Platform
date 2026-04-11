import type { LearnerProfile } from '@/types/profile';
import { readStorage, writeStorage, removeStorage } from './storage';
import { isLearnerProfile } from './profileGuard';

const PROFILE_KEY = 'codequest:profile';

export function loadProfile(): LearnerProfile | null {
  return readStorage(PROFILE_KEY, isLearnerProfile);
}

export function saveProfile(profile: LearnerProfile): void {
  writeStorage(PROFILE_KEY, profile);
}

export function clearProfile(): void {
  removeStorage(PROFILE_KEY);
}
