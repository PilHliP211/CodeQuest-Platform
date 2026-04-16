import type { ReactElement } from 'react';

export const BLOCKS_FALLBACK_THRESHOLD = 3;

export interface BlocksFallbackHintProps {
  attemptCount: number;
  onTryBlocks: () => void;
}

/**
 * Rendered in Phase 3 beneath the editor. Appears only after the learner has
 * run their code at least {@link BLOCKS_FALLBACK_THRESHOLD} times without
 * success. Clicking the hint switches the editor toggle to the read-only
 * blocks view so the learner can see the block shape of a valid solution.
 *
 * The parent owns both `attemptCount` (from the lesson runner) and the
 * `onTryBlocks` effect (usually `setActiveView('blocks')`).
 */
export function BlocksFallbackHint({
  attemptCount,
  onTryBlocks,
}: BlocksFallbackHintProps): ReactElement | null {
  if (attemptCount < BLOCKS_FALLBACK_THRESHOLD) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={onTryBlocks}
      className="font-pixel text-xs text-yellow-300 underline"
    >
      Need help? Try blocks →
    </button>
  );
}
