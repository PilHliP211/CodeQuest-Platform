import type { ReactElement } from 'react';

interface RunButtonProps {
  isRunning: boolean;
  onRun: () => void;
}

export function RunButton({ isRunning, onRun }: RunButtonProps): ReactElement {
  return (
    <button
      type="button"
      onClick={onRun}
      disabled={isRunning}
      aria-busy={isRunning}
      className="rounded border-2 border-green-900 bg-green-600 px-4 py-2 font-pixel text-xs text-white disabled:cursor-not-allowed disabled:opacity-50"
    >
      {isRunning ? 'Running...' : 'Run \u25b6'}
    </button>
  );
}
