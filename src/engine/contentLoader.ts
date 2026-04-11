import type { Course } from '@/types/content';
import { isCourse } from './contentGuard';
import rawCourse from '../../content/flag-hunter/course.json';

/**
 * Load and validate the active content pack.
 *
 * In v1 this is a static import bundled at build time.
 * In v2+ this will be replaced with a dynamic import or fetch.
 *
 * @throws Error if the content pack fails validation
 */
export function loadContent(): Course {
  if (!isCourse(rawCourse)) {
    throw new Error(
      'Content pack validation failed: "content/flag-hunter/course.json" does not ' +
        'match the required Course schema. Check that all required fields are present ' +
        '(id, title, description, version, map, lessons, xp, villain, player).',
    );
  }
  return rawCourse;
}
