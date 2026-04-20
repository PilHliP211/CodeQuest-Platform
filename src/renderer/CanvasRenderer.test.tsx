import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { CanvasRenderer } from './CanvasRenderer';

interface CanvasOperation {
  readonly name: string;
  readonly args: readonly number[];
}

interface FakeCanvasContext {
  readonly ctx: CanvasRenderingContext2D;
  readonly operations: CanvasOperation[];
}

let activeContext: FakeCanvasContext;
const originalGetContextDescriptor = Object.getOwnPropertyDescriptor(
  HTMLCanvasElement.prototype,
  'getContext',
);

function createFakeContext(): FakeCanvasContext {
  const operations: CanvasOperation[] = [];
  const context = {
    setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void {
      operations.push({ name: 'setTransform', args: [a, b, c, d, e, f] });
    },
    clearRect(x: number, y: number, width: number, height: number): void {
      operations.push({ name: 'clearRect', args: [x, y, width, height] });
    },
  };

  return {
    ctx: context as unknown as CanvasRenderingContext2D,
    operations,
  };
}

function getCanvas(): HTMLCanvasElement {
  const element = screen.getByRole('img', { name: /flag drawing canvas/i });
  if (!(element instanceof HTMLCanvasElement)) {
    throw new Error('Expected the renderer element to be a canvas.');
  }

  return element;
}

beforeEach(() => {
  activeContext = createFakeContext();
  Object.defineProperty(window, 'devicePixelRatio', {
    configurable: true,
    value: 2,
  });
  HTMLCanvasElement.prototype.getContext = function getContext(
    contextId: string,
  ): CanvasRenderingContext2D | null {
    return contextId === '2d' ? activeContext.ctx : null;
  } as HTMLCanvasElement['getContext'];
});

afterEach(() => {
  if (originalGetContextDescriptor !== undefined) {
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', originalGetContextDescriptor);
  }
});

describe('CanvasRenderer', () => {
  it('renders a named canvas at the requested logical size with a scaled backing buffer', () => {
    render(<CanvasRenderer width={300} height={200} />);

    const canvas = getCanvas();

    expect(canvas.width).toBe(600);
    expect(canvas.height).toBe(400);
    expect(canvas).toHaveStyle({
      width: '300px',
      height: '200px',
      imageRendering: 'pixelated',
    });
    expect(activeContext.operations).toContainEqual({
      name: 'setTransform',
      args: [2, 0, 0, 2, 0, 0],
    });
  });

  it('lets the learner reset the visible canvas', async () => {
    const handleReset = vi.fn();
    const user = userEvent.setup();
    render(<CanvasRenderer width={300} height={200} onReset={handleReset} />);

    await user.click(screen.getByRole('button', { name: /reset canvas/i }));

    expect(handleReset).toHaveBeenCalledOnce();
    expect(activeContext.operations).toContainEqual({
      name: 'clearRect',
      args: [0, 0, 300, 200],
    });
  });
});
