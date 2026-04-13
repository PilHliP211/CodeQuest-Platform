import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { NarrativePlayer } from './NarrativePlayer';
import type { NarrativeScene } from '@/types/content';

const twoSceneScript: readonly NarrativeScene[] = [
  {
    dialogue: [{ speaker: 'Narrator', text: 'Scene 1 line', portrait: null }],
  },
  {
    dialogue: [{ speaker: 'Guide', text: 'Scene 2 line', portrait: null }],
  },
];

const singleSceneScript: readonly NarrativeScene[] = [
  {
    dialogue: [{ speaker: 'Narrator', text: 'Only scene', portrait: null }],
  },
];

describe('NarrativePlayer', () => {
  it('renders the first scene on mount', () => {
    render(<NarrativePlayer script={twoSceneScript} onComplete={vi.fn()} />);

    expect(screen.getByText('Scene 1 line')).toBeInTheDocument();
  });

  it('advances to the next scene when the current scene completes', async () => {
    render(<NarrativePlayer script={twoSceneScript} onComplete={vi.fn()} />);
    const user = userEvent.setup();

    // Advance past the single line of scene 1
    await user.click(screen.getByRole('button', { name: /advance dialogue/i }));

    expect(screen.getByText('Scene 2 line')).toBeInTheDocument();
  });

  it('calls onComplete after the last scene completes', async () => {
    const handleComplete = vi.fn();
    render(<NarrativePlayer script={singleSceneScript} onComplete={handleComplete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /advance dialogue/i }));

    expect(handleComplete).toHaveBeenCalledOnce();
  });

  it('calls onComplete immediately for an empty script', () => {
    const handleComplete = vi.fn();
    render(<NarrativePlayer script={[]} onComplete={handleComplete} />);

    expect(handleComplete).toHaveBeenCalledOnce();
  });

  it('shows the skip button when skippable is true', () => {
    render(<NarrativePlayer script={singleSceneScript} onComplete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /skip narrative/i })).toBeInTheDocument();
  });

  it('hides the skip button when skippable is false', () => {
    render(<NarrativePlayer script={singleSceneScript} onComplete={vi.fn()} skippable={false} />);

    expect(screen.queryByRole('button', { name: /skip narrative/i })).not.toBeInTheDocument();
  });

  it('skip button calls onComplete immediately', async () => {
    const handleComplete = vi.fn();
    render(<NarrativePlayer script={twoSceneScript} onComplete={handleComplete} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /skip narrative/i }));

    expect(handleComplete).toHaveBeenCalledOnce();
  });

  it('skip button is keyboard-accessible', async () => {
    const handleComplete = vi.fn();
    render(<NarrativePlayer script={twoSceneScript} onComplete={handleComplete} />);
    const user = userEvent.setup();

    screen.getByRole('button', { name: /skip narrative/i }).focus();
    await user.keyboard('{Enter}');

    expect(handleComplete).toHaveBeenCalledOnce();
  });

  it('skip button has type="button"', () => {
    render(<NarrativePlayer script={singleSceneScript} onComplete={vi.fn()} />);

    expect(screen.getByRole('button', { name: /skip narrative/i })).toHaveAttribute(
      'type',
      'button',
    );
  });
});
