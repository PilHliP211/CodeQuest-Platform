import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { ContentContext } from '@/engine/ContentContext';
import { getTotalXP } from '@/engine/progressStore';
import { testCourse } from '@/test/contentFixture';
import { testLesson } from '@/test/lessonFixture';
import { LessonScreen } from './LessonScreen';

vi.mock('@/editor/BlockEditor', () => ({
  BlockEditor: ({
    phase,
    onCodeGenerated,
  }: {
    phase: 1 | 2 | 3;
    onCodeGenerated: (code: string) => void;
  }) => {
    const solution = phase === 1 ? 'moveEast()' : 'searchArea()\ncollectItem()';

    return (
      <div>
        <p>block editor phase {phase}</p>
        <button
          type="button"
          onClick={() => {
            onCodeGenerated('');
          }}
        >
          Run phase {phase} empty
        </button>
        <button
          type="button"
          onClick={() => {
            onCodeGenerated(solution);
          }}
        >
          Run phase {phase} solution
        </button>
      </div>
    );
  },
}));

vi.mock('@/editor/EditorToggle', () => ({
  EditorToggle: ({
    syntaxEditorProps,
  }: {
    syntaxEditorProps: { onRun: (code: string) => void };
  }) => (
    <button
      type="button"
      onClick={() => {
        syntaxEditorProps.onRun('fillBackground("white")\ndrawCircle(150, 100, 60, "red")');
      }}
    >
      Run flag solution
    </button>
  ),
}));

const originalGetContextDescriptor = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  'getContext',
);
const canvasOperations: string[] = [];

function recordCanvasOperation(name: string): void {
  canvasOperations.push(name);
}

function installCanvasContext(): void {
  HTMLCanvasElement.prototype.getContext = function getContext(
    this: HTMLCanvasElement,
    contextId: string,
  ): CanvasRenderingContext2D | null {
    if (contextId !== '2d') {
      return null;
    }

    return {
      canvas: this,
      setTransform() {
        recordCanvasOperation('setTransform');
      },
      clearRect() {
        recordCanvasOperation('clearRect');
      },
      fillRect() {
        recordCanvasOperation('fillRect');
      },
      beginPath() {
        recordCanvasOperation('beginPath');
      },
      arc() {
        recordCanvasOperation('arc');
      },
      fill() {
        recordCanvasOperation('fill');
      },
      save() {
        recordCanvasOperation('save');
      },
      translate() {
        recordCanvasOperation('translate');
      },
      rotate() {
        recordCanvasOperation('rotate');
      },
      restore() {
        recordCanvasOperation('restore');
      },
      moveTo() {
        recordCanvasOperation('moveTo');
      },
      lineTo() {
        recordCanvasOperation('lineTo');
      },
      closePath() {
        recordCanvasOperation('closePath');
      },
    } as unknown as CanvasRenderingContext2D;
  } as HTMLCanvasElement['getContext'];
}

function renderLesson(handleReturnToMap = vi.fn()): ReturnType<typeof render> {
  return render(
    <ContentContext.Provider value={{ course: testCourse, lessons: [testLesson] }}>
      <LessonScreen lesson={testLesson} onReturnToMap={handleReturnToMap} />
    </ContentContext.Provider>,
  );
}

beforeEach(() => {
  localStorage.clear();
  canvasOperations.length = 0;
  installCanvasContext();
});

afterEach(() => {
  if (originalGetContextDescriptor !== undefined) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', originalGetContextDescriptor);
  }
});

describe('LessonScreen', () => {
  it('starts with the phase 1 narrative and opens the first challenge', async () => {
    renderLesson();
    const user = userEvent.setup();

    expect(screen.getByText('Phase 1 intro')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /advance dialogue/i }));

    expect(screen.getByText('Move to Japan.')).toBeInTheDocument();
    expect(screen.getByText('block editor phase 1')).toBeInTheDocument();
  });

  it('shows a hint after a failed attempt is submitted', async () => {
    renderLesson();
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /advance dialogue/i }));
    await user.click(screen.getByRole('button', { name: /run phase 1 empty/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/did not solve/i);

    await user.click(screen.getByRole('button', { name: /^hint$/i }));

    expect(screen.getByText('Move east.')).toBeInTheDocument();
  });

  it('advances through all phases and returns to the map after completion', async () => {
    const handleReturnToMap = vi.fn();
    renderLesson(handleReturnToMap);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /advance dialogue/i }));
    await user.click(screen.getByRole('button', { name: /run phase 1 solution/i }));
    await user.click(screen.getByRole('button', { name: /skip narrative/i }));
    await user.click(screen.getByRole('button', { name: /skip narrative/i }));

    expect(screen.getByText('Find the flag pieces.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /run phase 2 solution/i }));
    await user.click(screen.getByRole('button', { name: /skip narrative/i }));
    await user.click(screen.getByRole('button', { name: /skip narrative/i }));

    expect(screen.getByText('Restore the flag.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /run flag solution/i }));
    await user.click(screen.getByRole('button', { name: /celebrate restored flag/i }));

    expect(screen.getByText('Japan flag restored.')).toBeInTheDocument();
    expect(getTotalXP()).toBe(85);

    await user.click(screen.getByRole('button', { name: /return to map/i }));

    expect(handleReturnToMap).toHaveBeenCalledOnce();
  });
});
