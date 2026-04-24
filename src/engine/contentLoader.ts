import type { Course, Lesson } from '@/types/content';
import { isCourse, isLesson } from './contentGuard';
import rawCourse from '../../content/flag-hunter/course.json';

const lessonModules = import.meta.glob<unknown>(
  '../../content/flag-hunter/lessons/**/lesson.json',
  {
    eager: true,
    import: 'default',
  },
);

export interface LoadedContent {
  course: Course;
  lessons: readonly Lesson[];
}

/**
 * Load and validate the active content pack.
 *
 * In v1 this is a static import bundled at build time.
 * In v2+ this will be replaced with a dynamic import or fetch.
 *
 * @throws Error if the content pack fails validation
 */
export function loadContent(): LoadedContent {
  if (!isCourse(rawCourse)) {
    throw new Error(
      'Content pack validation failed: "content/flag-hunter/course.json" does not ' +
        'match the required Course schema. Check that all required fields are present ' +
        '(id, title, description, version, map, lessons, xp, villain, player).',
    );
  }
  return {
    course: rawCourse,
    lessons: loadLessons(rawCourse),
  };
}

function loadLessons(course: Course): readonly Lesson[] {
  return course.lessons.map((lessonRef) => {
    const modulePath = `../../content/flag-hunter/${lessonRef.path}`;
    const rawLesson = lessonModules[modulePath];

    if (rawLesson === undefined) {
      throw new Error(
        `Content pack validation failed: "${lessonRef.path}" was listed in course.json but was not found.`,
      );
    }

    if (!isLesson(rawLesson)) {
      throw new Error(
        `Content pack validation failed: "${lessonRef.path}" does not match the required Lesson schema.`,
      );
    }

    if (rawLesson.id !== lessonRef.id) {
      throw new Error(
        `Content pack validation failed: "${lessonRef.path}" has id "${rawLesson.id}" but course.json references "${lessonRef.id}".`,
      );
    }

    return rawLesson;
  });
}
