import React from 'react';
import { useProfile } from '@/engine/useProfile';

interface HUDProps {
  onOpenSettings: () => void;
}

export function HUD({ onOpenSettings }: HUDProps): React.ReactElement {
  const { profile } = useProfile();
  return (
    <header className="flex items-center justify-between bg-gray-800 px-4 py-2">
      <span className="font-pixel text-sm text-green-400">{profile?.name ?? ''}</span>
      <button
        type="button"
        onClick={onOpenSettings}
        className="font-pixel text-xs text-green-300 hover:text-green-200"
        aria-label="Open settings"
      >
        Settings
      </button>
    </header>
  );
}
