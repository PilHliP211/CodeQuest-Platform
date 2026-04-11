import React, { useState } from 'react';
import { useProfile } from '@/engine/useProfile';
import { NameEntryScreen } from '@/components/Profile/NameEntryScreen';
import { SettingsScreen } from '@/components/Profile/SettingsScreen';
import { HUDLayout } from '@/components/HUD/HUDLayout';

function App(): React.JSX.Element {
  const { profile } = useProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);

  if (profile === null) {
    return <NameEntryScreen />;
  }

  if (settingsOpen) {
    return (
      <SettingsScreen
        onClose={() => {
          setSettingsOpen(false);
        }}
      />
    );
  }

  return (
    <HUDLayout
      onOpenSettings={() => {
        setSettingsOpen(true);
      }}
    >
      <div className="flex flex-1 items-center justify-center">
        <p className="font-pixel text-green-400">Your adventure begins...</p>
      </div>
    </HUDLayout>
  );
}

export default App;
