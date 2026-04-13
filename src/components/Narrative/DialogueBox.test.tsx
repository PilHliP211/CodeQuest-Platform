import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { DialogueBox } from './DialogueBox';

describe('DialogueBox', () => {
  it('renders the speaker name and dialogue text', () => {
    render(<DialogueBox speaker="Narrator" text="Hello world" onAdvance={vi.fn()} />);

    expect(screen.getByText('Narrator')).toBeInTheDocument();
    expect(screen.getByText('Hello world')).toBeInTheDocument();
  });

  it('calls onAdvance when clicked', async () => {
    const handleAdvance = vi.fn();
    render(<DialogueBox speaker="Narrator" text="Hello" onAdvance={handleAdvance} />);
    const user = userEvent.setup();

    await user.click(screen.getByRole('button', { name: /advance dialogue/i }));

    expect(handleAdvance).toHaveBeenCalledOnce();
  });

  it('calls onAdvance when Enter is pressed', async () => {
    const handleAdvance = vi.fn();
    render(<DialogueBox speaker="Narrator" text="Hello" onAdvance={handleAdvance} />);
    const user = userEvent.setup();

    screen.getByRole('button', { name: /advance dialogue/i }).focus();
    await user.keyboard('{Enter}');

    expect(handleAdvance).toHaveBeenCalledOnce();
  });

  it('calls onAdvance when Space is pressed', async () => {
    const handleAdvance = vi.fn();
    render(<DialogueBox speaker="Narrator" text="Hello" onAdvance={handleAdvance} />);
    const user = userEvent.setup();

    screen.getByRole('button', { name: /advance dialogue/i }).focus();
    await user.keyboard(' ');

    expect(handleAdvance).toHaveBeenCalledOnce();
  });

  it('has an aria-live region for dialogue text', () => {
    render(<DialogueBox speaker="Narrator" text="New line" onAdvance={vi.fn()} />);

    const liveRegion = screen.getByText('New line');
    expect(liveRegion).toHaveAttribute('aria-live', 'polite');
  });

  it('shows a blinking advance indicator', () => {
    render(<DialogueBox speaker="Narrator" text="Hello" onAdvance={vi.fn()} />);

    const indicator = document.querySelector('[aria-hidden="true"]');
    expect(indicator).toBeInTheDocument();
  });
});
