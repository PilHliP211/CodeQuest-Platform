import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePlayerAnimation } from './usePlayerAnimation';

interface AnimateToProps {
  animateTo: { x: number; y: number } | null;
}

const startPos = { x: 100, y: 100 };
const targetPos = { x: 500, y: 300 };

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
});

describe('usePlayerAnimation', () => {
  it('starts at the current position with no animation', () => {
    const { result } = renderHook(() => usePlayerAnimation(startPos, null, vi.fn()));

    expect(result.current.displayPosition).toEqual(startPos);
    expect(result.current.isAnimating).toBe(false);
  });

  it('moves displayPosition to animateTo and sets isAnimating true', () => {
    const { result, rerender } = renderHook(
      ({ animateTo }: AnimateToProps) => usePlayerAnimation(startPos, animateTo, vi.fn()),
      { initialProps: { animateTo: null } as AnimateToProps },
    );

    act(() => {
      rerender({ animateTo: targetPos });
    });

    expect(result.current.displayPosition).toEqual(targetPos);
    expect(result.current.isAnimating).toBe(true);
  });

  it('calls onAnimationEnd and clears isAnimating after ~650ms', () => {
    const onEnd = vi.fn();
    const { result, rerender } = renderHook(
      ({ animateTo }: AnimateToProps) => usePlayerAnimation(startPos, animateTo, onEnd),
      { initialProps: { animateTo: null } as AnimateToProps },
    );

    act(() => {
      rerender({ animateTo: targetPos });
    });

    expect(result.current.isAnimating).toBe(true);
    expect(onEnd).not.toHaveBeenCalled();

    act(() => {
      vi.advanceTimersByTime(650);
    });

    expect(result.current.isAnimating).toBe(false);
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('cancels previous animation timer when animateTo changes mid-flight', () => {
    const onEnd = vi.fn();
    const secondTarget = { x: 800, y: 400 };

    const { result, rerender } = renderHook(
      ({ animateTo }: AnimateToProps) => usePlayerAnimation(startPos, animateTo, onEnd),
      { initialProps: { animateTo: null } as AnimateToProps },
    );

    act(() => {
      rerender({ animateTo: targetPos });
    });

    // Advance partway through first animation
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // New animation starts before first completes
    act(() => {
      rerender({ animateTo: secondTarget });
    });

    expect(result.current.displayPosition).toEqual(secondTarget);

    // Advance past the first timer's original deadline but not the second (300+650=950ms)
    act(() => {
      vi.advanceTimersByTime(400); // total 700ms — first timer was cancelled, second hasn't fired yet
    });

    expect(onEnd).not.toHaveBeenCalled();

    // Advance enough for the second timer to complete (needs 650ms from when it started)
    act(() => {
      vi.advanceTimersByTime(300); // total 1000ms — second timer fires at 300+650=950ms
    });

    // onEnd called exactly once (for the second animation)
    expect(onEnd).toHaveBeenCalledOnce();
  });

  it('does not animate when animateTo is null', () => {
    const onEnd = vi.fn();
    const { result } = renderHook(() => usePlayerAnimation(startPos, null, onEnd));

    act(() => {
      vi.advanceTimersByTime(1000);
    });

    expect(result.current.isAnimating).toBe(false);
    expect(onEnd).not.toHaveBeenCalled();
  });
});
