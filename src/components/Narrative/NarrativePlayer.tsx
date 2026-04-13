import React, { useEffect, useRef, useState } from 'react';
import type { NarrativeScene } from '@/types/content';
import { SceneRenderer } from './SceneRenderer';

interface NarrativePlayerProps {
  script: readonly NarrativeScene[];
  onComplete: () => void;
  skippable?: boolean;
}

export function NarrativePlayer({
  script,
  onComplete,
  skippable = true,
}: NarrativePlayerProps): React.ReactElement {
  const [sceneIndex, setSceneIndex] = useState(0);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Guard: empty script — complete immediately without rendering
  useEffect(() => {
    if (script.length === 0) {
      onCompleteRef.current();
    }
  }, [script.length]);

  const handleSceneComplete = (): void => {
    if (sceneIndex < script.length - 1) {
      setSceneIndex((i) => i + 1);
    } else {
      onComplete();
    }
  };

  const currentScene = script[sceneIndex];
  if (currentScene === undefined) {
    return <></>;
  }

  return (
    <div className="relative w-full h-full">
      {skippable && (
        <button
          type="button"
          className="absolute top-3 right-3 z-10 font-pixel text-xs text-white/70 hover:text-white focus:outline-none focus:ring-2 focus:ring-white/50 rounded px-2 py-1"
          aria-label="Skip narrative and continue"
          onClick={onComplete}
        >
          Skip &#x25B6;&#x25B6;
        </button>
      )}
      <SceneRenderer key={sceneIndex} scene={currentScene} onSceneComplete={handleSceneComplete} />
    </div>
  );
}
