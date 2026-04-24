import React, { useContext, useState } from 'react';
import { useProfile } from '@/engine/useProfile';
import { ContentContext, ContentErrorContext } from '@/engine/ContentContext';
import { NameEntryScreen } from '@/components/Profile/NameEntryScreen';
import { SettingsScreen } from '@/components/Profile/SettingsScreen';
import { HUDLayout } from '@/components/HUD/HUDLayout';
import { MapScreen } from '@/components/Map/MapScreen';
import { LessonScreen } from '@/components/Lesson/LessonScreen';

function App(): React.JSX.Element {
  const contentError = useContext(ContentErrorContext);
  const content = useContext(ContentContext);
  const { profile } = useProfile();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);

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

  if (content === undefined) {
    return (
      <main
        role="alert"
        aria-live="assertive"
        className="flex min-h-screen flex-col items-center justify-center bg-gray-900 p-8 text-center"
      >
        <h1 className="mb-4 font-['Press_Start_2P'] text-xl text-red-400">Content Pack Error</h1>
        <p className="max-w-lg font-['Press_Start_2P'] text-sm leading-relaxed text-gray-200">
          The game content is unavailable.
        </p>
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

  const activeLesson =
    activeLessonId === null
      ? null
      : (content.lessons.find((lesson) => lesson.id === activeLessonId) ?? null);

  if (activeLesson !== null) {
    return (
      <LessonScreen
        lesson={activeLesson}
        onReturnToMap={() => {
          setActiveLessonId(null);
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
      <MapScreen onNodeSelect={setActiveLessonId} />
    </HUDLayout>
  );
}

export { App };
