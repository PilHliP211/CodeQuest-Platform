import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { LessonProvider } from './LessonProvider';
import { useLessonRunner } from './useLessonRunner';
import { testLesson } from '@/test/lessonFixture';

function LessonConsumer(): React.ReactElement {
  const { lesson, lessonState, dispatch } = useLessonRunner();

  return (
    <div>
      <p>
        {lesson.title}: {lessonState.phaseStatus}
      </p>
      <button
        type="button"
        onClick={() => {
          dispatch({ type: 'NARRATIVE_COMPLETE' });
        }}
      >
        Finish intro
      </button>
    </div>
  );
}

describe('LessonProvider', () => {
  it('exposes the active lesson and visible phase state to children', async () => {
    render(
      <LessonProvider lesson={testLesson}>
        <LessonConsumer />
      </LessonProvider>,
    );
    const user = userEvent.setup();

    expect(screen.getByText('Japan: narrative-intro')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /finish intro/i }));

    expect(screen.getByText('Japan: challenge')).toBeInTheDocument();
  });
});

describe('useLessonRunner', () => {
  it('throws when used outside LessonProvider', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => undefined);

    expect(() => {
      render(<LessonConsumer />);
    }).toThrow('useLessonRunner must be used inside <LessonProvider>');

    spy.mockRestore();
  });
});
