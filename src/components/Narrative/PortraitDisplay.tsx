import React from 'react';

interface PortraitDisplayProps {
  portrait: string | null | undefined;
  alt: string;
}

export function PortraitDisplay({ portrait, alt }: PortraitDisplayProps): React.ReactElement {
  if (portrait === null || portrait === undefined) {
    return <></>;
  }

  return (
    <img
      src={portrait}
      alt={alt}
      className="w-16 h-16 object-contain"
      style={{ imageRendering: 'pixelated' }}
    />
  );
}
