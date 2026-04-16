import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { BlocksFallbackHint } from './BlocksFallbackHint';

describe('BlocksFallbackHint', () => {
  it('stays hidden before the learner has struggled enough to need help', () => {
    render(<BlocksFallbackHint attemptCount={2} onTryBlocks={vi.fn()} />);

    expect(screen.queryByRole('button', { name: /try blocks/i })).not.toBeInTheDocument();
  });

  it('offers a blocks fallback after three failed attempts', () => {
    render(<BlocksFallbackHint attemptCount={3} onTryBlocks={vi.fn()} />);

    expect(screen.getByRole('button', { name: /need help\?.*try blocks/i })).toBeInTheDocument();
  });

  it('switches the learner to the blocks view when the hint is clicked', async () => {
    const user = userEvent.setup();
    const onTryBlocks = vi.fn();
    render(<BlocksFallbackHint attemptCount={3} onTryBlocks={onTryBlocks} />);

    await user.click(screen.getByRole('button', { name: /try blocks/i }));

    expect(onTryBlocks).toHaveBeenCalledTimes(1);
  });
});
