import React from 'react';

interface Position {
  x: number;
  y: number;
}

interface VillainTrailProps {
  position: Position;
  sprite: string;
}

export function VillainTrail({ position, sprite }: VillainTrailProps): React.ReactElement {
  return (
    <img
      src={sprite}
      alt=""
      aria-hidden="true"
      className="absolute w-8 h-8 translate-x-[-50%] translate-y-[-50%] pointer-events-none opacity-50"
      style={{ left: position.x, top: position.y }}
    />
  );
}
