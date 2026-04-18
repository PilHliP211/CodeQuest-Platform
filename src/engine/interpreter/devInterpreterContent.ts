import rawDevInterpreterContent from '../../../content/flag-hunter/dev-interpreter.json';

export interface DevInterpreterContent {
  title: string;
  prompt: string;
  initialCode: string;
  blockedCode: string;
  availableFunctions: readonly string[];
}

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isDevInterpreterContent(value: unknown): value is DevInterpreterContent {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    typeof value.title === 'string' &&
    typeof value.prompt === 'string' &&
    typeof value.initialCode === 'string' &&
    typeof value.blockedCode === 'string' &&
    isStringArray(value.availableFunctions)
  );
}

export function loadDevInterpreterContent(): DevInterpreterContent {
  const content: unknown = rawDevInterpreterContent;

  if (!isDevInterpreterContent(content)) {
    throw new Error('Dev interpreter content is invalid.');
  }

  return content;
}
