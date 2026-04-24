import React from 'react';
import { render, type RenderResult } from '@testing-library/react';
import { ContentContext } from '@/engine/ContentContext';
import { testCourse } from './contentFixture';
import { testLesson } from './lessonFixture';
import type { Course, Lesson } from '@/types/content';

/**
 * Renders a component inside a ContentContext provider pre-loaded with the
 * flag-hunter test fixture (or a custom course if provided).
 */
export function renderWithContent(
  ui: React.ReactElement,
  course: Course = testCourse,
  lessons: readonly Lesson[] = [testLesson],
): RenderResult {
  return render(
    <ContentContext.Provider value={{ course, lessons }}>{ui}</ContentContext.Provider>,
  );
}
