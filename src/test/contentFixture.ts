import type { Course } from '@/types/content';

/** Minimal valid course fixture backed by the flag-hunter content pack. */
export const testCourse: Course = {
  id: 'flag-hunter',
  title: 'CodeQuest: Flag Hunter',
  description: 'Test course',
  version: '1.0.0',
  map: {
    backgroundImage: 'assets/world-map.png',
    width: 1200,
    height: 600,
    startNodeId: '001-japan',
    nodes: [
      {
        id: '001-japan',
        label: 'Japan',
        x: 0.82,
        y: 0.28,
        unlocksOnComplete: ['002-brazil'],
        initiallyUnlocked: true,
        collectedIcon: 'assets/flags/japan.png',
      },
      {
        id: '002-brazil',
        label: 'Brazil',
        x: 0.35,
        y: 0.65,
        unlocksOnComplete: [],
        initiallyUnlocked: false,
        collectedIcon: 'assets/flags/brazil.png',
      },
    ],
    edges: [{ from: '001-japan', to: '002-brazil' }],
  },
  lessons: [
    { id: '001-japan', path: 'lessons/001-japan/lesson.json' },
    { id: '002-brazil', path: 'lessons/002-brazil/lesson.json' },
  ],
  xp: { phaseComplete: 10, lessonComplete: 50, hintUsed: -5, syntaxEditorUsed: 5 },
  villain: {
    name: 'The Eraser',
    sprite: 'assets/villain.png',
    trailSprite: 'assets/villain-trail.png',
  },
  player: { sprite: 'assets/player.png' },
};
