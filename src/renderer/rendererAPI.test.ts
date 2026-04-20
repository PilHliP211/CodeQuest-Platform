import fc from 'fast-check';
import { describe, expect, it } from 'vitest';
import type { AvailableFunction } from '@/types/content';
import { buildRendererScope, createRendererAPI, type RendererAPI } from './rendererAPI';

interface CanvasOperation {
  readonly name: string;
  readonly args: readonly (string | number)[];
}

interface FakeContextResult {
  readonly ctx: CanvasRenderingContext2D;
  readonly operations: CanvasOperation[];
}

const drawingFunctionNames = [
  'fillBackground',
  'drawRect',
  'drawCircle',
  'drawStripe',
  'drawTriangle',
] as const;

function createFakeContext(width = 300, height = 200): FakeContextResult {
  const operations: CanvasOperation[] = [];
  let fillStyleValue: string | CanvasGradient | CanvasPattern = '#000000';

  const context = {
    canvas: { width, height },
    get fillStyle(): string | CanvasGradient | CanvasPattern {
      return fillStyleValue;
    },
    set fillStyle(value: string | CanvasGradient | CanvasPattern) {
      fillStyleValue = value;
      operations.push({
        name: 'fillStyle',
        args: [typeof value === 'string' ? value : 'canvas-fill'],
      });
    },
    fillRect(x: number, y: number, rectWidth: number, rectHeight: number): void {
      operations.push({ name: 'fillRect', args: [x, y, rectWidth, rectHeight] });
    },
    beginPath(): void {
      operations.push({ name: 'beginPath', args: [] });
    },
    arc(x: number, y: number, radius: number, startAngle: number, endAngle: number): void {
      operations.push({ name: 'arc', args: [x, y, radius, startAngle, endAngle] });
    },
    fill(): void {
      operations.push({ name: 'fill', args: [] });
    },
    save(): void {
      operations.push({ name: 'save', args: [] });
    },
    translate(x: number, y: number): void {
      operations.push({ name: 'translate', args: [x, y] });
    },
    rotate(angle: number): void {
      operations.push({ name: 'rotate', args: [angle] });
    },
    restore(): void {
      operations.push({ name: 'restore', args: [] });
    },
    moveTo(x: number, y: number): void {
      operations.push({ name: 'moveTo', args: [x, y] });
    },
    lineTo(x: number, y: number): void {
      operations.push({ name: 'lineTo', args: [x, y] });
    },
    closePath(): void {
      operations.push({ name: 'closePath', args: [] });
    },
    clearRect(x: number, y: number, rectWidth: number, rectHeight: number): void {
      operations.push({ name: 'clearRect', args: [x, y, rectWidth, rectHeight] });
    },
  };

  return {
    ctx: context as unknown as CanvasRenderingContext2D,
    operations,
  };
}

function makeAvailableFunction(name: string): AvailableFunction {
  return {
    name,
    signature: `${name}()`,
    description: name,
    example: `${name}()`,
  };
}

function createAPI(): RendererAPI {
  return createRendererAPI(createFakeContext().ctx);
}

describe('createRendererAPI', () => {
  it('fills the full backing canvas and records the background call', () => {
    const { ctx, operations } = createFakeContext(600, 400);
    const api = createRendererAPI(ctx);

    api.fillBackground('white');

    expect(operations).toContainEqual({ name: 'fillRect', args: [0, 0, 600, 400] });
    expect(api.getCallLog()).toEqual([{ fn: 'fillBackground', args: ['white'] }]);
  });

  it('draws the visible circle described by player code', () => {
    const { ctx, operations } = createFakeContext();
    const api = createRendererAPI(ctx);

    api.drawCircle(150, 100, 60, 'red');

    expect(operations).toEqual([
      { name: 'beginPath', args: [] },
      { name: 'arc', args: [150, 100, 60, 0, Math.PI * 2] },
      { name: 'fillStyle', args: ['red'] },
      { name: 'fill', args: [] },
    ]);
    expect(api.getCallLog()).toEqual([{ fn: 'drawCircle', args: [150, 100, 60, 'red'] }]);
  });

  it('rotates a stripe around its center when an angle is provided', () => {
    const { ctx, operations } = createFakeContext();
    const api = createRendererAPI(ctx);

    api.drawStripe(10, 20, 100, 30, 'green', 45);

    expect(operations).toEqual([
      { name: 'fillStyle', args: ['green'] },
      { name: 'save', args: [] },
      { name: 'translate', args: [60, 35] },
      { name: 'rotate', args: [Math.PI / 4] },
      { name: 'fillRect', args: [-50, -15, 100, 30] },
      { name: 'restore', args: [] },
    ]);
    expect(api.getCallLog()).toEqual([{ fn: 'drawStripe', args: [10, 20, 100, 30, 'green', 45] }]);
  });

  it('ignores invalid colors without changing the learner-visible call log', () => {
    const { ctx, operations } = createFakeContext();
    const api = createRendererAPI(ctx);

    api.fillBackground('   ');

    expect(operations).toEqual([]);
    expect(api.getCallLog()).toEqual([]);
  });

  it('returns a call log copy so callers cannot mutate renderer history', () => {
    const api = createRendererAPI(createFakeContext().ctx);
    api.drawRect(1, 2, 3, 4, 'blue');

    const firstRead = api.getCallLog();
    firstRead.push({ fn: 'drawCircle', args: [0, 0, 1, 'red'] });

    expect(api.getCallLog()).toEqual([{ fn: 'drawRect', args: [1, 2, 3, 4, 'blue'] }]);
  });

  it('clears the canvas and call log on reset', () => {
    const { ctx, operations } = createFakeContext(300, 200);
    const api = createRendererAPI(ctx);
    api.drawRect(1, 2, 3, 4, 'blue');

    api.reset();

    expect(operations).toContainEqual({ name: 'clearRect', args: [0, 0, 300, 200] });
    expect(api.getCallLog()).toEqual([]);
  });
});

describe('buildRendererScope', () => {
  it('exposes exactly the drawing functions listed by the lesson', () => {
    const scope = buildRendererScope(createAPI(), [
      makeAvailableFunction('fillBackground'),
      makeAvailableFunction('drawCircle'),
    ]);

    expect(Object.keys(scope).sort()).toEqual(['drawCircle', 'fillBackground']);
    expect(scope.getCallLog).toBeUndefined();
    expect(scope.clearCallLog).toBeUndefined();
    expect(scope.reset).toBeUndefined();
  });

  it('never exposes internal renderer methods for generated allowlists', () => {
    const candidateName = fc.constantFrom(
      ...drawingFunctionNames,
      'getCallLog',
      'clearCallLog',
      'reset',
      'unknownFunction',
    );
    const drawingNameSet = new Set<string>(drawingFunctionNames);

    fc.assert(
      fc.property(fc.array(candidateName, { maxLength: 12 }), (names) => {
        const scope = buildRendererScope(createAPI(), names.map(makeAvailableFunction));
        const expectedKeys = [...new Set(names.filter((name) => drawingNameSet.has(name)))].sort();

        expect(Object.keys(scope).sort()).toEqual(expectedKeys);
        expect(scope.getCallLog).toBeUndefined();
        expect(scope.clearCallLog).toBeUndefined();
        expect(scope.reset).toBeUndefined();
      }),
      { numRuns: 200 },
    );
  });
});
