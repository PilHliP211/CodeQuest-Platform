import rawDevCanvasContent from '../../content/flag-hunter/dev-harnesses/dev-canvas.json';
import type {
  AvailableFunction,
  CanvasConfig,
  CanvasSolution,
  SolutionCall,
} from '@/types/content';

export interface DevCanvasContent {
  title: string;
  prompt: string;
  initialCode: string;
  solutionCode: string;
  wrongCode: string;
  canvas: CanvasConfig;
}

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isAvailableFunction(value: unknown): value is AvailableFunction {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    typeof value.name === 'string' &&
    typeof value.signature === 'string' &&
    typeof value.description === 'string' &&
    typeof value.example === 'string'
  );
}

function isAvailableFunctionArray(value: unknown): value is readonly AvailableFunction[] {
  return Array.isArray(value) && value.every(isAvailableFunction);
}

function isSolutionArg(value: unknown): value is string | number {
  return typeof value === 'string' || typeof value === 'number';
}

function isSolutionCall(value: unknown): value is SolutionCall {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    typeof value.fn === 'string' && Array.isArray(value.args) && value.args.every(isSolutionArg)
  );
}

function isCanvasSolution(value: unknown): value is CanvasSolution {
  if (!isNonNullObject(value)) {
    return false;
  }

  return Array.isArray(value.calls) && value.calls.every(isSolutionCall);
}

function isCanvasConfig(value: unknown): value is CanvasConfig {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    typeof value.width === 'number' &&
    typeof value.height === 'number' &&
    isAvailableFunctionArray(value.availableFunctions) &&
    isCanvasSolution(value.solution) &&
    typeof value.tolerance === 'number'
  );
}

function isDevCanvasContent(value: unknown): value is DevCanvasContent {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    typeof value.title === 'string' &&
    typeof value.prompt === 'string' &&
    typeof value.initialCode === 'string' &&
    typeof value.solutionCode === 'string' &&
    typeof value.wrongCode === 'string' &&
    isCanvasConfig(value.canvas)
  );
}

export function loadDevCanvasContent(): DevCanvasContent {
  const content: unknown = rawDevCanvasContent;

  if (!isDevCanvasContent(content)) {
    throw new Error('Dev canvas content is invalid.');
  }

  return content;
}
