import React from 'react';
import type { ReactNode } from 'react';
import { HUD } from './HUD';

interface HUDLayoutProps {
  children: ReactNode;
  onOpenSettings: () => void;
}

export function HUDLayout({ children, onOpenSettings }: HUDLayoutProps): React.ReactElement {
  return (
    <div className="flex min-h-screen flex-col">
      <HUD onOpenSettings={onOpenSettings} />
      <main className="flex-1">{children}</main>
    </div>
  );
}
