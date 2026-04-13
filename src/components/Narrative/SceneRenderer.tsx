import React, { useCallback, useEffect, useState } from 'react';
import type { NarrativeScene } from '@/types/content';
import { DialogueBox } from './DialogueBox';
import { PortraitDisplay } from './PortraitDisplay';

interface SceneRendererProps {
  scene: NarrativeScene;
  onSceneComplete: () => void;
  autoAdvanceMs?: number;
}

export function SceneRenderer({
  scene,
  onSceneComplete,
  autoAdvanceMs,
}: SceneRendererProps): React.ReactElement {
  const [lineIndex, setLineIndex] = useState(0);

  // Guard: empty dialogue array — complete immediately
  useEffect(() => {
    if (scene.dialogue.length === 0) {
      onSceneComplete();
    }
  }, [scene, onSceneComplete]);

  const handleAdvance = useCallback((): void => {
    if (lineIndex < scene.dialogue.length - 1) {
      setLineIndex((i) => i + 1);
    } else {
      onSceneComplete();
    }
  }, [lineIndex, scene.dialogue.length, onSceneComplete]);

  // Auto-advance timer (S-05.07 wires this)
  useEffect(() => {
    if (autoAdvanceMs === undefined) return;

    const timerId: ReturnType<typeof setTimeout> = setTimeout(() => {
      handleAdvance();
    }, autoAdvanceMs);

    return () => {
      clearTimeout(timerId);
    };
  }, [lineIndex, autoAdvanceMs, handleAdvance]);

  if (scene.dialogue.length === 0) {
    return <></>;
  }

  const currentLine = scene.dialogue[lineIndex];
  if (currentLine === undefined) {
    return <></>;
  }

  return (
    <div className="relative w-full h-full flex flex-col">
      {scene.background !== undefined && (
        <div
          className="flex-1 bg-cover bg-center"
          style={{ backgroundImage: `url(${scene.background})` }}
          aria-hidden="true"
        />
      )}

      <div className="flex items-end">
        <PortraitDisplay portrait={currentLine.portrait} alt={`${currentLine.speaker} portrait`} />
        <DialogueBox
          speaker={currentLine.speaker}
          text={currentLine.text}
          onAdvance={handleAdvance}
        />
      </div>
    </div>
  );
}
