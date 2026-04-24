import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { useContext } from 'react';
import { ContentProvider } from './ContentProvider';
import { ContentErrorContext } from './ContentContext';
import { useContent } from './useContent';
import { testLesson } from '@/test/lessonFixture';
import type { Course } from '@/types/content';

// Minimal valid course fixture
const validCourse: Course = {
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
        unlocksOnComplete: [],
        initiallyUnlocked: true,
        collectedIcon: 'assets/flags/japan.png',
      },
    ],
    edges: [],
  },
  lessons: [{ id: '001-japan', path: 'lessons/001-japan/lesson.json' }],
  xp: { phaseComplete: 10, lessonComplete: 50, hintUsed: -5, syntaxEditorUsed: 5 },
  villain: { name: 'The Eraser', sprite: 'assets/villain.png', trailSprite: 'assets/trail.png' },
  player: { sprite: 'assets/player.png' },
};

vi.mock('./contentLoader');

import { loadContent } from './contentLoader';
const mockLoadContent = vi.mocked(loadContent);

beforeEach(() => {
  vi.resetAllMocks();
});

function CourseTitle(): React.ReactElement {
  const { course, lessons } = useContent();
  return (
    <span>
      {course.title}: {lessons[0]?.title}
    </span>
  );
}

function ErrorDisplay(): React.ReactElement {
  const error = useContext(ContentErrorContext);
  return <span>{error ?? 'no-error'}</span>;
}

describe('ContentProvider', () => {
  it('makes the course available to children via useContent when load succeeds', () => {
    mockLoadContent.mockReturnValue({ course: validCourse, lessons: [testLesson] });

    render(
      <ContentProvider>
        <CourseTitle />
      </ContentProvider>,
    );

    expect(screen.getByText('CodeQuest: Flag Hunter: Japan')).toBeInTheDocument();
  });

  it('exposes a null error when load succeeds', () => {
    mockLoadContent.mockReturnValue({ course: validCourse, lessons: [testLesson] });

    render(
      <ContentProvider>
        <ErrorDisplay />
      </ContentProvider>,
    );

    expect(screen.getByText('no-error')).toBeInTheDocument();
  });

  it('exposes the error message via ContentErrorContext when load fails', () => {
    mockLoadContent.mockImplementation(() => {
      throw new Error('Schema validation failed');
    });

    render(
      <ContentProvider>
        <ErrorDisplay />
      </ContentProvider>,
    );

    expect(screen.getByText('Schema validation failed')).toBeInTheDocument();
  });
});

describe('useContent', () => {
  it('throws when called outside ContentProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => {
      render(<CourseTitle />);
    }).toThrow('useContent must be used within <ContentProvider>');

    spy.mockRestore();
  });
});
