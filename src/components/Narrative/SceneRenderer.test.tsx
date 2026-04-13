import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { act, render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SceneRenderer } from './SceneRenderer';
import type { NarrativeScene } from '@/types/content';

const twoLineScene: NarrativeScene = {
  background: 'assets/bg.png',
  dialogue: [
    { speaker: 'Narrator', text: 'Line one', portrait: null },
    { speaker: 'Player', text: 'Line two', portrait: 'assets/player.png' },
  ],
};

const singleLineScene: NarrativeScene = {
  dialogue: [{ speaker: 'Narrator', text: 'Only line', portrait: null }],
};

const emptyScene: NarrativeScene = {
  dialogue: [],
};

describe('SceneRenderer', () => {
  it('renders the first dialogue line on mount', () => {
    render(<SceneRenderer scene={twoLineScene} onSceneComplete={vi.fn()} />);

    expect(screen.getByText('Narrator')).toBeInTheDocument();
    expect(screen.getByText('Line one')).toBeInTheDocument();
  });

  it('advances to the next line when the dialogue box is clicked', async () => {
    render(<SceneRenderer scene={twoLineScene} onSceneComplete={vi.fn()} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /advance dialogue/i }));

    expect(screen.getByText('Player')).toBeInTheDocument();
    expect(screen.getByText('Line two')).toBeInTheDocument();
  });

  it('calls onSceneComplete when advancing past the last line', async () => {
    const handleComplete = vi.fn();
    render(<SceneRenderer scene={singleLineScene} onSceneComplete={handleComplete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /advance dialogue/i }));

    expect(handleComplete).toHaveBeenCalledOnce();
  });

  it('shows the portrait when the current line has one', async () => {
    render(<SceneRenderer scene={twoLineScene} onSceneComplete={vi.fn()} />);
    const user = userEvent.setup();

    // First line has no portrait
    expect(screen.queryByRole('img')).not.toBeInTheDocument();

    // Advance to second line which has a portrait
    await user.click(screen.getByRole('button', { name: /advance dialogue/i }));

    expect(screen.getByRole('img', { name: /player portrait/i })).toBeInTheDocument();
  });

  it('renders the background image when scene has one', () => {
    render(<SceneRenderer scene={twoLineScene} onSceneComplete={vi.fn()} />);

    const bg = document.querySelector('[aria-hidden="true"]');
    expect(bg).toBeInTheDocument();
  });

  it('calls onSceneComplete immediately for empty dialogue', () => {
    const handleComplete = vi.fn();
    render(<SceneRenderer scene={emptyScene} onSceneComplete={handleComplete} />);

    expect(handleComplete).toHaveBeenCalledOnce();
  });

  describe('auto-advance', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('auto-advances after the specified delay', () => {
      render(<SceneRenderer scene={twoLineScene} onSceneComplete={vi.fn()} autoAdvanceMs={2000} />);

      expect(screen.getByText('Line one')).toBeInTheDocument();

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(screen.getByText('Line two')).toBeInTheDocument();
    });

    it('calls onSceneComplete when auto-advancing past the last line', () => {
      const handleComplete = vi.fn();
      render(
        <SceneRenderer
          scene={singleLineScene}
          onSceneComplete={handleComplete}
          autoAdvanceMs={1000}
        />,
      );

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(handleComplete).toHaveBeenCalledOnce();
    });

    it('does not auto-advance when autoAdvanceMs is not set', () => {
      render(<SceneRenderer scene={twoLineScene} onSceneComplete={vi.fn()} />);

      act(() => {
        vi.advanceTimersByTime(10000);
      });

      // Still on first line
      expect(screen.getByText('Line one')).toBeInTheDocument();
    });
  });
});
