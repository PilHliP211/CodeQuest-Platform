import { useMemo, useReducer, type ReactNode } from 'react';
import type { Lesson } from '@/types/content';
import { createInitialState, lessonReducer } from './lessonRunner';
import { LessonContext, type LessonContextValue } from './LessonContext';

export function LessonProvider({
  lesson,
  children,
}: {
  lesson: Lesson;
  children: ReactNode;
}): React.ReactElement {
  const [lessonState, dispatch] = useReducer(lessonReducer, lesson.id, createInitialState);

  const value = useMemo<LessonContextValue>(
    () => ({ lessonState, dispatch, lesson }),
    [lessonState, lesson],
  );

  return <LessonContext.Provider value={value}>{children}</LessonContext.Provider>;
}
