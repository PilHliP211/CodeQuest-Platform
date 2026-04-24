import React, { useState } from 'react';
import { useContent } from '@/engine/useContent';
import { usePlayerAnimation } from './usePlayerAnimation';
import { MapCanvas } from './MapCanvas';
import { PlayerMarker } from './PlayerMarker';
import { VillainTrail } from './VillainTrail';

interface MapScreenProps {
  onNodeSelect: (nodeId: string) => void;
}

export function MapScreen({ onNodeSelect }: MapScreenProps): React.ReactElement {
  const { course } = useContent();
  const { map } = course;

  // Stub: current node comes from progress store (E-12)
  const [currentNodeId, setCurrentNodeId] = useState<string>(map.startNodeId);

  // Stub: animateTo will be set by lesson runner (E-11) when Phase 1 succeeds
  const [animateTo, setAnimateTo] = useState<string | undefined>(undefined);
  // setAnimateTo will be called from E-11; referenced here to satisfy TypeScript
  void setAnimateTo;

  function handleAnimationEnd(): void {
    // After animation, update current node to the destination
    if (animateTo !== undefined) {
      setCurrentNodeId(animateTo);
    }
  }

  const currentNode = map.nodes.find((n) => n.id === currentNodeId);
  const currentPixelPosition =
    currentNode !== undefined
      ? { x: currentNode.x * map.width, y: currentNode.y * map.height }
      : { x: 0, y: 0 };

  const animateToPosition =
    animateTo !== undefined
      ? (() => {
          const node = map.nodes.find((n) => n.id === animateTo);
          return node !== undefined ? { x: node.x * map.width, y: node.y * map.height } : null;
        })()
      : null;

  const { displayPosition, isAnimating } = usePlayerAnimation(
    currentPixelPosition,
    animateToPosition,
    handleAnimationEnd,
  );

  // Stub: villain trail uses the first node until E-11 provides real data
  const villainNode = map.nodes[0];
  const villainPixelPosition =
    villainNode !== undefined
      ? { x: villainNode.x * map.width, y: villainNode.y * map.height }
      : null;

  return (
    <div className="relative overflow-hidden" style={{ width: map.width, height: map.height }}>
      <MapCanvas
        onNodeSelect={onNodeSelect}
        currentNodeId={currentNodeId}
        animateTo={animateTo}
        onAnimationEnd={handleAnimationEnd}
      />
      <PlayerMarker
        position={displayPosition}
        sprite={course.player.sprite}
        isAnimating={isAnimating}
      />
      {villainPixelPosition !== null && (
        <VillainTrail position={villainPixelPosition} sprite={course.villain.trailSprite} />
      )}
    </div>
  );
}
