import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { PortraitDisplay } from './PortraitDisplay';

describe('PortraitDisplay', () => {
  it('renders an image when portrait is a string', () => {
    render(<PortraitDisplay portrait="assets/player.png" alt="Player portrait" />);

    const img = screen.getByRole('img', { name: /player portrait/i });
    expect(img).toHaveAttribute('src', 'assets/player.png');
  });

  it('applies pixelated image rendering', () => {
    render(<PortraitDisplay portrait="assets/player.png" alt="Player portrait" />);

    const img = screen.getByRole('img', { name: /player portrait/i });
    expect(img.style.imageRendering).toBe('pixelated');
  });

  it('renders nothing when portrait is null', () => {
    const { container } = render(<PortraitDisplay portrait={null} alt="Player portrait" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('');
  });

  it('renders nothing when portrait is undefined', () => {
    const { container } = render(<PortraitDisplay portrait={undefined} alt="Player portrait" />);

    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.innerHTML).toBe('');
  });
});
