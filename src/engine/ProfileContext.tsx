import { createContext } from 'react';
import type { LearnerProfile } from '@/types/profile';

export interface ProfileContextValue {
  profile: LearnerProfile | null;
  createProfile: (name: string) => void;
  updateName: (name: string) => void;
}

// Exported for ProfileProvider and useProfile only — consumers must use useProfile(), not useContext directly.
export const ProfileContext = createContext<ProfileContextValue | undefined>(undefined);
