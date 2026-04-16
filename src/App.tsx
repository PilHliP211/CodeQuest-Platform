import React, { useContext, useState } from 'react';
import { useProfile } from '@/engine/useProfile';
import { ContentErrorContext } from '@/engine/ContentContext';
import { NameEntryScreen } from '@/components/Profile/NameEntryScreen';
import { SettingsScreen } from '@/components/Profile/SettingsScreen';
import { HUDLayout } from '@/components/HUD/HUDLayout';
import { MapScreen } from '@/components/Map/MapScreen';
import { DevBlockEditorScreen } from '@/editor/DevBlockEditorScreen';
import { DevSyntaxEditorScreen } from '@/editor/DevSyntaxEditorScreen';

function App(): React.JSX.Element {
  const contentError = useContext(ContentErrorContext);
  const { profile } = useProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const isDevBlockEditorRoute = window.location.pathname.endsWith('/__dev/block-editor');
  const isDevSyntaxEditorRoute = window.location.pathname.endsWith('/__dev/syntax-editor');

  if (isDevBlockEditorRoute) {
    return <DevBlockEditorScreen />;
  }

  if (isDevSyntaxEditorRoute) {
    return <DevSyntaxEditorScreen />;
  }

  if (contentError !== null) {
    return (
      <main
        role="alert"
        aria-live="assertive"
        className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 text-center"
      >
        <h1 className="mb-4 font-['Press_Start_2P'] text-xl text-red-400">Content Pack Error</h1>
        <p className="mb-6 max-w-lg font-['Press_Start_2P'] text-sm leading-relaxed text-gray-200">
          The game content failed to load. Please check the browser console for details.
        </p>
        <pre className="max-w-lg overflow-auto rounded bg-gray-800 p-4 text-left text-xs text-yellow-300">
          {contentError}
        </pre>
      </main>
    );
  }

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
      <MapScreen />
    </HUDLayout>
  );
}

export { App };
