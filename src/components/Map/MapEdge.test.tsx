import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MapEdge } from './MapEdge';

describe('MapEdge', () => {
  it('renders an SVG line with the correct endpoints', () => {
    const { container } = render(
      <svg>
        <MapEdge from={{ x: 100, y: 200 }} to={{ x: 300, y: 400 }} />
      </svg>,
    );

    const line = container.querySelector('line');
    expect(line).not.toBeNull();
    expect(line).toHaveAttribute('x1', '100');
    expect(line).toHaveAttribute('y1', '200');
    expect(line).toHaveAttribute('x2', '300');
    expect(line).toHaveAttribute('y2', '400');
  });
});
