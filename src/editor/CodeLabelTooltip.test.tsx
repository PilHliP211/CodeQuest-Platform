import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { CodeLabelTooltip } from './CodeLabelTooltip';

describe('CodeLabelTooltip', () => {
  it('renders the "?" trigger button', () => {
    render(<CodeLabelTooltip />);

    expect(screen.getByRole('button', { name: /what are these code labels/i })).toBeInTheDocument();
  });

  it('tooltip is not visible by default', () => {
    render(<CodeLabelTooltip />);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('opens the tooltip when the button is clicked', async () => {
    const user = userEvent.setup();
    render(<CodeLabelTooltip />);

    await user.click(screen.getByRole('button', { name: /what are these code labels/i }));

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('displays the correct explanatory copy when open', async () => {
    const user = userEvent.setup();
    render(<CodeLabelTooltip />);

    await user.click(screen.getByRole('button', { name: /what are these code labels/i }));

    expect(screen.getByRole('tooltip')).toHaveTextContent(
      /These are the actual code commands your blocks run!/i,
    );
    expect(screen.getByRole('tooltip')).toHaveTextContent(/you'll type them yourself/i);
  });

  it('closes the tooltip when the button is clicked a second time', async () => {
    const user = userEvent.setup();
    render(<CodeLabelTooltip />);

    const btn = screen.getByRole('button', { name: /what are these code labels/i });
    await user.click(btn);
    await user.click(btn);

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('wires aria-describedby to the tooltip id when open', async () => {
    const user = userEvent.setup();
    render(<CodeLabelTooltip />);

    const btn = screen.getByRole('button', { name: /what are these code labels/i });
    await user.click(btn);

    const tooltip = screen.getByRole('tooltip');
    expect(btn).toHaveAttribute('aria-describedby', tooltip.id);
  });

  it('removes aria-describedby when the tooltip is closed', async () => {
    const user = userEvent.setup();
    render(<CodeLabelTooltip />);

    const btn = screen.getByRole('button', { name: /what are these code labels/i });
    await user.click(btn);
    await user.click(btn);

    expect(btn).not.toHaveAttribute('aria-describedby');
  });

  it('closes the tooltip when Escape is pressed', async () => {
    const user = userEvent.setup();
    render(<CodeLabelTooltip />);

    const btn = screen.getByRole('button', { name: /what are these code labels/i });
    await user.click(btn);
    expect(screen.getByRole('tooltip')).toBeInTheDocument();

    await user.keyboard('{Escape}');

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('toggles the tooltip with Enter key', async () => {
    const user = userEvent.setup();
    render(<CodeLabelTooltip />);

    const btn = screen.getByRole('button', { name: /what are these code labels/i });
    btn.focus();
    await user.keyboard('{Enter}');

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });

  it('toggles the tooltip with Space key', async () => {
    const user = userEvent.setup();
    render(<CodeLabelTooltip />);

    const btn = screen.getByRole('button', { name: /what are these code labels/i });
    btn.focus();
    await user.keyboard(' ');

    expect(screen.getByRole('tooltip')).toBeInTheDocument();
  });
});
