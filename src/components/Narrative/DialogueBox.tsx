import React from 'react';

interface DialogueBoxProps {
  speaker: string;
  text: string;
  onAdvance: () => void;
}

export function DialogueBox({ speaker, text, onAdvance }: DialogueBoxProps): React.ReactElement {
  const handleKeyDown = (e: React.KeyboardEvent): void => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onAdvance();
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label="Advance dialogue"
      onClick={onAdvance}
      onKeyDown={handleKeyDown}
      className="relative w-full bg-gray-900 border-t-4 border-white min-h-24 cursor-pointer select-none"
    >
      <p className="font-pixel text-yellow-300 text-xs px-4 pt-3 pb-1">{speaker}</p>
      <p className="font-pixel text-white text-xs leading-relaxed px-4 pb-4" aria-live="polite">
        {text}
      </p>
      <span
        className="absolute bottom-2 right-3 font-pixel text-white text-xs animate-bounce"
        aria-hidden="true"
      >
        &#x25BC;
      </span>
    </div>
  );
}
