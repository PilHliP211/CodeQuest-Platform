import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { PlayerMarker } from './PlayerMarker';

describe('PlayerMarker', () => {
  it('renders the sprite at the given pixel position', () => {
    const { container } = render(
      <PlayerMarker position={{ x: 984, y: 168 }} sprite="assets/player.png" />,
    );

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveStyle({ left: '984px', top: '168px' });
  });

  it('has alt="" and aria-hidden for decorative treatment', () => {
    const { container } = render(
      <PlayerMarker position={{ x: 0, y: 0 }} sprite="assets/player.png" />,
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('aria-hidden', 'true');
  });

  it('does not apply transition class when not animating', () => {
    const { container } = render(
      <PlayerMarker position={{ x: 0, y: 0 }} sprite="assets/player.png" isAnimating={false} />,
    );

    const img = container.querySelector('img');
    expect(img?.className).not.toContain('transition');
  });

  it('applies transition class when animating', () => {
    const { container } = render(
      <PlayerMarker position={{ x: 0, y: 0 }} sprite="assets/player.png" isAnimating={true} />,
    );

    const img = container.querySelector('img');
    expect(img?.className).toContain('transition');
  });
});
