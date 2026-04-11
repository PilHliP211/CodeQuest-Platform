import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { MapNode } from './MapNode';
import type { MapNode as MapNodeData } from '@/types/content';

const testNode: MapNodeData = {
  id: '001-japan',
  label: 'Japan',
  x: 0.82,
  y: 0.28,
  unlocksOnComplete: [],
  initiallyUnlocked: true,
  collectedIcon: 'assets/flags/japan.png',
};

describe('MapNode', () => {
  it('shows the node label in all states', () => {
    const { rerender } = render(<MapNode node={testNode} state="locked" />);
    expect(screen.getByRole('button', { name: /japan/i })).toBeInTheDocument();

    rerender(<MapNode node={testNode} state="available" />);
    expect(screen.getByRole('button', { name: /japan/i })).toBeInTheDocument();

    rerender(<MapNode node={testNode} state="completed" />);
    expect(screen.getByRole('button', { name: /japan/i })).toBeInTheDocument();
  });

  it('locked node is disabled and cannot be clicked', async () => {
    const handleClick = vi.fn();
    render(<MapNode node={testNode} state="locked" onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /japan.*locked/i });
    expect(button).toBeDisabled();

    const user = userEvent.setup();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('available node fires onClick when clicked', async () => {
    const handleClick = vi.fn();
    render(<MapNode node={testNode} state="available" onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /japan.*available/i });
    expect(button).not.toBeDisabled();

    const user = userEvent.setup();
    await user.click(button);
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('available node fires onClick on keyboard Enter', async () => {
    const handleClick = vi.fn();
    render(<MapNode node={testNode} state="available" onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /japan.*available/i });
    button.focus();

    const user = userEvent.setup();
    await user.keyboard('{Enter}');
    expect(handleClick).toHaveBeenCalledOnce();
  });

  it('completed node shows the flag icon overlay', () => {
    render(<MapNode node={testNode} state="completed" />);
    // The flag emoji is aria-hidden, but the button label includes "completed"
    expect(screen.getByRole('button', { name: /japan.*completed/i })).toBeInTheDocument();
    // The 🚩 span is in the DOM
    expect(document.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it('completed node is disabled and cannot be clicked', async () => {
    const handleClick = vi.fn();
    render(<MapNode node={testNode} state="completed" onClick={handleClick} />);

    const button = screen.getByRole('button', { name: /japan.*completed/i });
    expect(button).toBeDisabled();

    const user = userEvent.setup();
    await user.click(button);
    expect(handleClick).not.toHaveBeenCalled();
  });

  it('positions the node using x/y coordinates as percentages', () => {
    render(<MapNode node={testNode} state="available" />);
    const button = screen.getByRole('button', { name: /japan/i });
    // Verify percentage positioning (allow for floating-point representation)
    expect(button.style.left).toMatch(/^82(\.\d+)?%$/);
    expect(button.style.top).toMatch(/^28(\.\d+)?%$/);
  });

  it('aria-label includes both node label and state', () => {
    render(<MapNode node={testNode} state="available" />);
    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('Japan'));
    expect(button).toHaveAttribute('aria-label', expect.stringContaining('available'));
  });
});
