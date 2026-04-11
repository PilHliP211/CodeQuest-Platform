import React from 'react';

interface Position {
  x: number;
  y: number;
}

interface PlayerMarkerProps {
  position: Position;
  sprite: string;
  isAnimating?: boolean;
}

export function PlayerMarker({
  position,
  sprite,
  isAnimating = false,
}: PlayerMarkerProps): React.ReactElement {
  return (
    <img
      src={sprite}
      alt=""
      aria-hidden="true"
      className={[
        'absolute w-8 h-8 translate-x-[-50%] translate-y-[-50%]',
        'pointer-events-none',
        isAnimating && 'transition-[left,top] duration-[600ms] ease-in-out',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left: position.x, top: position.y }}
    />
  );
}
