import { useState } from 'react';
import type { KeyboardEvent, ReactElement } from 'react';

const TOOLTIP_ID = 'code-label-tooltip';

/**
 * Renders a "?" button that toggles an informational tooltip explaining the
 * code labels that appear inside blocks in Phase 2.
 *
 * Only rendered when `phase === 2` (caller's responsibility).
 */
export function CodeLabelTooltip(): ReactElement {
  const [open, setOpen] = useState(false);

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>): void {
    if (e.key === 'Escape') {
      setOpen(false);
    }
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        aria-label="What are these code labels?"
        aria-describedby={open ? TOOLTIP_ID : undefined}
        onClick={() => {
          setOpen((prev) => !prev);
        }}
        onBlur={() => {
          setOpen(false);
        }}
        onKeyDown={handleKeyDown}
        className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-yellow-300 bg-gray-900 font-pixel text-xs text-yellow-300 hover:bg-yellow-300 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-yellow-300"
      >
        ?
      </button>
      {open && (
        <div
          id={TOOLTIP_ID}
          role="tooltip"
          className="absolute right-0 top-8 z-10 max-w-[260px] rounded border-2 border-yellow-300 bg-gray-900 p-3 font-pixel text-xs leading-relaxed text-yellow-100 shadow-lg"
        >
          These are the actual code commands your blocks run! In the next level, you&apos;ll type
          them yourself.
        </div>
      )}
    </div>
  );
}
