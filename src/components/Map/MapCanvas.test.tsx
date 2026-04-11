import { describe, it, expect, vi } from 'vitest';
import { screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { renderWithContent } from '@/test/renderWithContent';
import { MapCanvas } from './MapCanvas';

describe('MapCanvas', () => {
  it('renders all map nodes from the content pack', () => {
    renderWithContent(<MapCanvas onNodeSelect={vi.fn()} currentNodeId="001-japan" />);

    expect(screen.getByRole('button', { name: /japan/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /brazil/i })).toBeInTheDocument();
  });

  it('calls onNodeSelect with the node id when an available node is clicked', async () => {
    const handleSelect = vi.fn();
    renderWithContent(<MapCanvas onNodeSelect={handleSelect} currentNodeId="001-japan" />);

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: /japan/i }));

    expect(handleSelect).toHaveBeenCalledWith('001-japan');
  });

  it('renders the background image', () => {
    renderWithContent(<MapCanvas onNodeSelect={vi.fn()} currentNodeId="001-japan" />);

    const img = screen.getByRole('img', { name: /world map/i });
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'assets/world-map.png');
  });

  it('renders the SVG edge overlay', () => {
    const { container } = renderWithContent(
      <MapCanvas onNodeSelect={vi.fn()} currentNodeId="001-japan" />,
    );

    // One edge between japan and brazil
    const line = container.querySelector('line');
    expect(line).not.toBeNull();
  });
});
