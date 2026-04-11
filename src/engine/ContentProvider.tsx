import { useMemo, useState, type ReactElement, type ReactNode } from 'react';
import type { Course } from '@/types/content';
import { ContentContext, ContentErrorContext } from './ContentContext';
import { loadContent } from './contentLoader';

export function ContentProvider({ children }: { children: ReactNode }): ReactElement {
  const [contentState] = useState<{ course: Course | null; error: string | null }>(() => {
    try {
      return { course: loadContent(), error: null };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while loading the content pack.';
      return { course: null, error: message };
    }
  });

  const contentValue = useMemo(
    () => (contentState.course !== null ? { course: contentState.course } : undefined),
    [contentState.course],
  );

  return (
    <ContentErrorContext.Provider value={contentState.error}>
      <ContentContext.Provider value={contentValue}>{children}</ContentContext.Provider>
    </ContentErrorContext.Provider>
  );
}
