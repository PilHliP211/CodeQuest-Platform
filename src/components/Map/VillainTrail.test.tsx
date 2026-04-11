import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { VillainTrail } from './VillainTrail';

describe('VillainTrail', () => {
  it('renders the trail sprite at the given pixel position', () => {
    const { container } = render(
      <VillainTrail position={{ x: 984, y: 168 }} sprite="assets/villain-trail.png" />,
    );

    const img = container.querySelector('img');
    expect(img).not.toBeNull();
    expect(img).toHaveStyle({ left: '984px', top: '168px' });
  });

  it('has alt="" and aria-hidden for decorative treatment', () => {
    const { container } = render(
      <VillainTrail position={{ x: 0, y: 0 }} sprite="assets/villain-trail.png" />,
    );

    const img = container.querySelector('img');
    expect(img).toHaveAttribute('alt', '');
    expect(img).toHaveAttribute('aria-hidden', 'true');
  });

  it('renders with reduced opacity for the ghost effect', () => {
    const { container } = render(
      <VillainTrail position={{ x: 0, y: 0 }} sprite="assets/villain-trail.png" />,
    );

    const img = container.querySelector('img');
    expect(img?.className).toContain('opacity-50');
  });
});
