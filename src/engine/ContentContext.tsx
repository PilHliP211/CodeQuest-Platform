import { createContext } from 'react';
import type { Course } from '@/types/content';

export interface ContentContextValue {
  course: Course;
}

// Exported for ContentProvider and useContent only — consumers must use useContent(), not useContext directly.
export const ContentContext = createContext<ContentContextValue | undefined>(undefined);

// Always set by ContentProvider; null means no error.
export const ContentErrorContext = createContext<string | null>(null);
