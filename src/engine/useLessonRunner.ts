import { useContext } from 'react';
import { LessonContext, type LessonContextValue } from './LessonContext';

export function useLessonRunner(): LessonContextValue {
  const ctx = useContext(LessonContext);
  if (ctx === undefined) {
    throw new Error('useLessonRunner must be used inside <LessonProvider>');
  }

  return ctx;
}
