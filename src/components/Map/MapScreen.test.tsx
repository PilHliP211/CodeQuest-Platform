import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithContent } from '@/test/renderWithContent';
import { MapScreen } from './MapScreen';

describe('MapScreen', () => {
  it('renders the map canvas with nodes', () => {
    renderWithContent(<MapScreen />);

    expect(screen.getByRole('button', { name: /japan/i })).toBeInTheDocument();
  });

  it('renders the player marker image', () => {
    const { container } = renderWithContent(<MapScreen />);

    // Player marker is decorative (alt=""), look for aria-hidden images
    const imgs = container.querySelectorAll('img[aria-hidden="true"]');
    expect(imgs.length).toBeGreaterThan(0);
  });

  it('logs a warning when an available node is clicked', async () => {
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    renderWithContent(<MapScreen />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /japan/i }));

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('lesson start not yet implemented'),
      '001-japan',
    );

    warnSpy.mockRestore();
  });
});
