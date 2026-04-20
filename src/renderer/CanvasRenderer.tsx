import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef } from 'react';

export interface CanvasRendererHandle {
  clear(): void;
  getContext(): CanvasRenderingContext2D;
  reset(): void;
}

interface CanvasRendererProps {
  width: number;
  height: number;
  className?: string;
  onReset?: () => void;
}

export const CanvasRenderer = forwardRef<CanvasRendererHandle, CanvasRendererProps>(
  function CanvasRenderer({ width, height, className, onReset }, ref) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (canvas === null) {
        return;
      }

      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);

      const ctx = canvas.getContext('2d');
      if (ctx === null) {
        return;
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }, [height, width]);

    const getContext = useCallback((): CanvasRenderingContext2D => {
      const canvas = canvasRef.current;
      if (canvas === null) {
        throw new Error('Canvas not mounted');
      }

      const ctx = canvas.getContext('2d');
      if (ctx === null) {
        throw new Error('Could not get 2D context');
      }

      return ctx;
    }, []);

    const clear = useCallback((): void => {
      const ctx = getContext();
      ctx.clearRect(0, 0, width, height);
    }, [getContext, height, width]);

    const reset = useCallback((): void => {
      onReset?.();
      clear();
    }, [clear, onReset]);

    useImperativeHandle(
      ref,
      () => ({
        clear,
        getContext,
        reset,
      }),
      [clear, getContext, reset],
    );

    return (
      <div className="flex flex-col items-start gap-2">
        <canvas
          ref={canvasRef}
          role="img"
          aria-label="Flag drawing canvas"
          style={{
            width,
            height,
            imageRendering: 'pixelated',
          }}
          className={className}
        />
        <button
          type="button"
          onClick={reset}
          aria-label="Reset canvas"
          className="rounded border-2 border-yellow-300 bg-yellow-300 px-3 py-2 font-pixel text-xs text-gray-950 hover:bg-yellow-200"
        >
          Reset ↺
        </button>
      </div>
    );
  },
);
