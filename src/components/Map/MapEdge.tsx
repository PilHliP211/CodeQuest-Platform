import React from 'react';

interface Point {
  x: number;
  y: number;
}

interface MapEdgeProps {
  from: Point;
  to: Point;
}

export function MapEdge({ from, to }: MapEdgeProps): React.ReactElement {
  return (
    <line
      x1={from.x}
      y1={from.y}
      x2={to.x}
      y2={to.y}
      stroke="#a78bfa"
      strokeWidth={2}
      strokeDasharray="6 4"
      opacity={0.6}
    />
  );
}
