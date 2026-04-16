import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { RunButton } from './RunButton';

describe('RunButton', () => {
  it('runs the current program when clicked', async () => {
    const handleRun = vi.fn();
    const user = userEvent.setup();
    render(<RunButton isRunning={false} onRun={handleRun} />);

    await user.click(screen.getByRole('button', { name: /run/i }));

    expect(handleRun).toHaveBeenCalledOnce();
  });

  it('tells the learner code is running and prevents another run', () => {
    render(<RunButton isRunning={true} onRun={vi.fn()} />);

    const button = screen.getByRole('button', { name: /running/i });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });
});
