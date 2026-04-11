import React from 'react';
import { useContent } from '@/engine/useContent';
import { MapEdge } from './MapEdge';
import { MapNode } from './MapNode';

interface MapCanvasProps {
  onNodeSelect: (nodeId: string) => void;
  currentNodeId: string;
  animateTo?: string | undefined;
  onAnimationEnd?: (() => void) | undefined;
}

export function MapCanvas({ onNodeSelect }: MapCanvasProps): React.ReactElement {
  const { course } = useContent();
  const { map } = course;

  // Stub: derive node state from progress store (E-12).
  // Until E-12 exists, all nodes are available.
  function getNodeState(_nodeId: string): 'locked' | 'available' | 'completed' {
    return 'available';
  }

  return (
    <div className="relative overflow-hidden" style={{ width: map.width, height: map.height }}>
      {/* Background image */}
      <img
        src={map.backgroundImage}
        alt="World map"
        className="absolute inset-0 w-full h-full object-cover"
        draggable={false}
      />

      {/* SVG overlay for edges — pointer-events: none so clicks reach nodes */}
      <svg
        className="absolute top-0 left-0 pointer-events-none"
        width={map.width}
        height={map.height}
        aria-hidden="true"
      >
        {map.edges.map((edge) => {
          const fromNode = map.nodes.find((n) => n.id === edge.from);
          const toNode = map.nodes.find((n) => n.id === edge.to);
          if (fromNode === undefined || toNode === undefined) return null;
          return (
            <MapEdge
              key={`${edge.from}-${edge.to}`}
              from={{ x: fromNode.x * map.width, y: fromNode.y * map.height }}
              to={{ x: toNode.x * map.width, y: toNode.y * map.height }}
            />
          );
        })}
      </svg>

      {/* Map nodes */}
      {map.nodes.map((node) => (
        <MapNode
          key={node.id}
          node={node}
          state={getNodeState(node.id)}
          onClick={() => {
            onNodeSelect(node.id);
          }}
        />
      ))}
    </div>
  );
}
