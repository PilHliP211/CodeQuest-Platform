import { describe, it, expect } from 'vitest';
import { isCourse } from './contentGuard';

const validCourse = {
  id: 'flag-hunter',
  title: 'CodeQuest: Flag Hunter',
  description: 'A test course',
  version: '1.0.0',
  map: {
    backgroundImage: 'assets/world-map.png',
    width: 1200,
    height: 600,
    startNodeId: '001-japan',
    nodes: [{ id: '001-japan', label: 'Japan', x: 0.82, y: 0.28 }],
    edges: [],
  },
  lessons: [{ id: '001-japan', path: 'lessons/001-japan/lesson.json' }],
  xp: { phaseComplete: 10, lessonComplete: 50, hintUsed: -5, syntaxEditorUsed: 5 },
  villain: { name: 'The Eraser', sprite: 'assets/villain.png', trailSprite: 'assets/trail.png' },
  player: { sprite: 'assets/player.png' },
};

describe('isCourse', () => {
  it('accepts a valid course pack', () => {
    expect(isCourse(validCourse)).toBe(true);
  });

  it('rejects null', () => {
    expect(isCourse(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isCourse(undefined)).toBe(false);
  });

  it('rejects an empty object', () => {
    expect(isCourse({})).toBe(false);
  });

  it('rejects a course where "id" is missing', () => {
    const bad = { ...validCourse, id: undefined };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "id" is an empty string', () => {
    const bad = { ...validCourse, id: '' };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "title" is missing', () => {
    const bad = { ...validCourse, title: undefined };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "description" is not a string', () => {
    const bad = { ...validCourse, description: 42 };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "version" is not a string', () => {
    const bad = { ...validCourse, version: 1 };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "map" is missing', () => {
    const bad = { ...validCourse, map: undefined };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "map.nodes" is not an array', () => {
    const bad = { ...validCourse, map: { ...validCourse.map, nodes: null } };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "map.edges" is not an array', () => {
    const bad = { ...validCourse, map: { ...validCourse.map, edges: 'none' } };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "map.width" is not a number', () => {
    const bad = { ...validCourse, map: { ...validCourse.map, width: '1200' } };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "lessons" is missing', () => {
    const bad = { ...validCourse, lessons: undefined };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "lessons" is an empty array', () => {
    const bad = { ...validCourse, lessons: [] };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "lessons" is not an array', () => {
    const bad = { ...validCourse, lessons: 'lesson-001' };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "xp" is missing', () => {
    const bad = { ...validCourse, xp: undefined };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "xp.phaseComplete" is not a number', () => {
    const bad = { ...validCourse, xp: { ...validCourse.xp, phaseComplete: '10' } };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "xp.lessonComplete" is not a number', () => {
    const bad = { ...validCourse, xp: { ...validCourse.xp, lessonComplete: null } };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "villain" is missing', () => {
    const bad = { ...validCourse, villain: undefined };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "villain.name" is not a string', () => {
    const bad = { ...validCourse, villain: { ...validCourse.villain, name: 99 } };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "player" is missing', () => {
    const bad = { ...validCourse, player: undefined };
    expect(isCourse(bad)).toBe(false);
  });

  it('rejects a course where "player.sprite" is not a string', () => {
    const bad = { ...validCourse, player: { sprite: false } };
    expect(isCourse(bad)).toBe(false);
  });
});
