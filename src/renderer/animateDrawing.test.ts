import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { animateDrawing } from './animateDrawing';

describe('animateDrawing', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('reveals drawing steps one delay at a time', async () => {
    const visibleSteps: string[] = [];
    const handleComplete = vi.fn();

    animateDrawing(
      [
        () => {
          visibleSteps.push('background');
        },
        () => {
          visibleSteps.push('circle');
        },
      ],
      150,
      handleComplete,
    );

    expect(visibleSteps).toEqual(['background']);
    await vi.advanceTimersByTimeAsync(149);
    expect(visibleSteps).toEqual(['background']);
    await vi.advanceTimersByTimeAsync(1);
    expect(visibleSteps).toEqual(['background', 'circle']);
    await vi.advanceTimersByTimeAsync(150);
    expect(handleComplete).toHaveBeenCalledOnce();
  });

  it('stops future drawing steps when cancelled', async () => {
    const visibleSteps: string[] = [];
    const handle = animateDrawing(
      [
        () => {
          visibleSteps.push('background');
        },
        () => {
          visibleSteps.push('circle');
        },
      ],
      150,
    );

    handle.cancel();
    await vi.advanceTimersByTimeAsync(150);

    expect(visibleSteps).toEqual(['background']);
  });

  it('completes empty animations without delaying', () => {
    const handleComplete = vi.fn();

    animateDrawing([], 150, handleComplete);

    expect(handleComplete).toHaveBeenCalledOnce();
  });
});
