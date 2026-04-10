import { useContext } from 'react';
import { ProfileContext, type ProfileContextValue } from './ProfileContext';

export function useProfile(): ProfileContextValue {
  const ctx = useContext(ProfileContext);
  if (ctx === undefined) {
    throw new Error('useProfile must be used within <ProfileProvider>');
  }
  return ctx;
}
