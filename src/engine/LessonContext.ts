import { createContext } from 'react';
import type { Lesson } from '@/types/content';
import type { LessonAction, LessonState } from '@/types/lessonState';

export interface LessonContextValue {
  lessonState: LessonState;
  dispatch: React.Dispatch<LessonAction>;
  lesson: Lesson;
}

export const LessonContext = createContext<LessonContextValue | undefined>(undefined);
