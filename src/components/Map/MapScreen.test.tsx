import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithContent } from '@/test/renderWithContent';
import { MapScreen } from './MapScreen';

describe('MapScreen', () => {
  it('renders the map canvas with nodes', () => {
    renderWithContent(<MapScreen onNodeSelect={vi.fn()} />);

    expect(screen.getByRole('button', { name: /japan/i })).toBeInTheDocument();
  });

  it('renders the player marker image', () => {
    const { container } = renderWithContent(<MapScreen onNodeSelect={vi.fn()} />);

    // Player marker is decorative (alt=""), look for aria-hidden images
    const imgs = container.querySelectorAll('img[aria-hidden="true"]');
    expect(imgs.length).toBeGreaterThan(0);
  });

  it('opens a lesson when an available node is clicked', async () => {
    const handleNodeSelect = vi.fn();
    renderWithContent(<MapScreen onNodeSelect={handleNodeSelect} />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /japan/i }));

    expect(handleNodeSelect).toHaveBeenCalledWith('001-japan');
  });
});
