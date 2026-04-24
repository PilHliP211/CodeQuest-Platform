import { useMemo, useState, type ReactElement, type ReactNode } from 'react';
import type { Course, Lesson } from '@/types/content';
import { ContentContext, ContentErrorContext } from './ContentContext';
import { loadContent } from './contentLoader';

export function ContentProvider({ children }: { children: ReactNode }): ReactElement {
  const [contentState] = useState<{
    course: Course | null;
    lessons: readonly Lesson[];
    error: string | null;
  }>(() => {
    try {
      const loadedContent = loadContent();
      return { course: loadedContent.course, lessons: loadedContent.lessons, error: null };
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'An unknown error occurred while loading the content pack.';
      return { course: null, lessons: [], error: message };
    }
  });

  const contentValue = useMemo(
    () =>
      contentState.course !== null
        ? { course: contentState.course, lessons: contentState.lessons }
        : undefined,
    [contentState.course, contentState.lessons],
  );

  return (
    <ContentErrorContext.Provider value={contentState.error}>
      <ContentContext.Provider value={contentValue}>{children}</ContentContext.Provider>
    </ContentErrorContext.Provider>
  );
}
