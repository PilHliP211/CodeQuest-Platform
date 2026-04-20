import type { AvailableFunction } from '@/types/content';

export interface RendererCall {
  fn: string;
  args: readonly (string | number)[];
}

export interface RendererAPI {
  fillBackground(color: string): void;
  drawRect(x: number, y: number, width: number, height: number, color: string): void;
  drawCircle(x: number, y: number, radius: number, color: string): void;
  drawStripe(
    x: number,
    y: number,
    width: number,
    height: number,
    color: string,
    angle?: number,
  ): void;
  drawTriangle(
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    x3: number,
    y3: number,
    color: string,
  ): void;
  getCallLog(): RendererCall[];
  clearCallLog(): void;
  reset(): void;
}

type DrawingFunctionName =
  | 'fillBackground'
  | 'drawRect'
  | 'drawCircle'
  | 'drawStripe'
  | 'drawTriangle';

const drawingFunctionNames: readonly DrawingFunctionName[] = [
  'fillBackground',
  'drawRect',
  'drawCircle',
  'drawStripe',
  'drawTriangle',
];

export function createRendererAPI(ctx: CanvasRenderingContext2D): RendererAPI {
  const callLog: RendererCall[] = [];

  function record(fn: DrawingFunctionName, args: readonly (string | number)[]): void {
    callLog.push({ fn, args: [...args] });
  }

  return {
    fillBackground(color) {
      if (!isValidColor(color)) {
        return;
      }

      ctx.fillStyle = color;
      ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      record('fillBackground', [color]);
    },

    drawRect(x, y, width, height, color) {
      if (!areFiniteNumbers([x, y, width, height]) || !isValidColor(color)) {
        return;
      }

      ctx.fillStyle = color;
      ctx.fillRect(x, y, width, height);
      record('drawRect', [x, y, width, height, color]);
    },

    drawCircle(x, y, radius, color) {
      if (!areFiniteNumbers([x, y, radius]) || radius < 0 || !isValidColor(color)) {
        return;
      }

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      record('drawCircle', [x, y, radius, color]);
    },

    drawStripe(x, y, width, height, color, angle) {
      const numberArgs = angle === undefined ? [x, y, width, height] : [x, y, width, height, angle];
      if (!areFiniteNumbers(numberArgs) || !isValidColor(color)) {
        return;
      }

      ctx.fillStyle = color;

      if (angle !== undefined && angle !== 0) {
        const centerX = x + width / 2;
        const centerY = y + height / 2;
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(degreesToRadians(angle));
        ctx.fillRect(-width / 2, -height / 2, width, height);
        ctx.restore();
      } else {
        ctx.fillRect(x, y, width, height);
      }

      const args =
        angle === undefined ? [x, y, width, height, color] : [x, y, width, height, color, angle];
      record('drawStripe', args);
    },

    drawTriangle(x1, y1, x2, y2, x3, y3, color) {
      if (!areFiniteNumbers([x1, y1, x2, y2, x3, y3]) || !isValidColor(color)) {
        return;
      }

      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineTo(x3, y3);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      record('drawTriangle', [x1, y1, x2, y2, x3, y3, color]);
    },

    getCallLog() {
      return callLog.map((call) => ({ fn: call.fn, args: [...call.args] }));
    },

    clearCallLog() {
      callLog.length = 0;
    },

    reset() {
      ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
      callLog.length = 0;
    },
  };
}

export function buildRendererScope(
  api: RendererAPI,
  availableFunctions: readonly AvailableFunction[],
): Record<string, (...args: unknown[]) => void> {
  const allowed = new Set(availableFunctions.map((fn) => fn.name));
  const scope: Record<string, (...args: unknown[]) => void> = {};

  for (const name of drawingFunctionNames) {
    if (allowed.has(name)) {
      scope[name] = api[name] as (...args: unknown[]) => void;
    }
  }

  return scope;
}

function isValidColor(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function areFiniteNumbers(values: readonly unknown[]): values is readonly number[] {
  return values.every((value) => typeof value === 'number' && Number.isFinite(value));
}

function degreesToRadians(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
