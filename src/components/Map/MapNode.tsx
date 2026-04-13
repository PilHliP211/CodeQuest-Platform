import React from 'react';
import type { MapNode as MapNodeData } from '@/types/content';

type NodeState = 'locked' | 'available' | 'completed';

interface MapNodeProps {
  node: MapNodeData;
  state: NodeState;
  onClick?: () => void;
}

export function MapNode({ node, state, onClick }: MapNodeProps): React.ReactElement {
  const isInteractive = state === 'available';

  return (
    <button
      type="button"
      className={[
        'absolute flex items-center justify-center',
        'w-10 h-10 rounded-full border-2 font-pixel text-xs',
        'translate-x-[-50%] translate-y-[-50%]',
        state === 'locked' &&
          'opacity-40 cursor-not-allowed border-gray-500 bg-gray-700 text-gray-400',
        state === 'available' &&
          'cursor-pointer border-yellow-400 bg-yellow-900 text-yellow-200 ring-2 ring-yellow-400 ring-offset-1 hover:scale-110 transition-transform',
        state === 'completed' && 'cursor-default border-green-400 bg-green-900 text-green-200',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{ left: `${String(node.x * 100)}%`, top: `${String(node.y * 100)}%` }}
      disabled={!isInteractive}
      onClick={isInteractive ? onClick : undefined}
      aria-label={`${node.label} \u2014 ${state}`}
      aria-disabled={!isInteractive}
    >
      {state === 'completed' && (
        <span className="absolute -top-1 -right-1 text-sm" aria-hidden="true">
          🚩
        </span>
      )}
      <span className="truncate px-1">{node.label}</span>
    </button>
  );
}
