import { useCallback, useMemo, useState, type ReactElement, type ReactNode } from 'react';
import type { LearnerProfile } from '@/types/profile';
import { ProfileContext, type ProfileContextValue } from './ProfileContext';
import { loadProfile, saveProfile } from './profileStore';

export function ProfileProvider({ children }: { children: ReactNode }): ReactElement {
  const [profile, setProfile] = useState<LearnerProfile | null>(() => loadProfile());

  const createProfile = useCallback((name: string): void => {
    const next: LearnerProfile = { name, createdAt: new Date().toISOString() };
    saveProfile(next);
    setProfile(next);
  }, []);

  const updateName = useCallback((name: string): void => {
    setProfile((prev) => {
      if (prev === null) return prev;
      const next: LearnerProfile = { ...prev, name };
      saveProfile(next);
      return next;
    });
  }, []);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, createProfile, updateName }),
    [profile, createProfile, updateName],
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}
