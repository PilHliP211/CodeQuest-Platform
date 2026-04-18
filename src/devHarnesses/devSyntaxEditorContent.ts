import rawDevSyntaxEditorContent from '../../content/flag-hunter/dev-harnesses/dev-syntax-editor.json';
import type { AvailableFunction, BlockDef } from '@/types/content';

export interface DevSyntaxEditorContent {
  packId: string;
  lessonId: string;
  title: string;
  prompt: string;
  initialCode: string;
  solutionCode: string;
  fallbackAfterAttempts: number;
  availableFunctions: readonly AvailableFunction[];
  availableBlocks: readonly string[];
  blocks: readonly BlockDef[];
}

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
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

function isBlocklyDef(value: unknown): value is BlockDef['blocklyDef'] {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    typeof value.type === 'string' &&
    typeof value.message0 === 'string' &&
    value.previousStatement === null &&
    value.nextStatement === null &&
    typeof value.colour === 'number' &&
    typeof value.tooltip === 'string' &&
    typeof value.helpUrl === 'string'
  );
}

function isBlockDef(value: unknown): value is BlockDef {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.label === 'string' &&
    typeof value.category === 'string' &&
    typeof value.color === 'number' &&
    typeof value.code === 'string' &&
    isBlocklyDef(value.blocklyDef)
  );
}

function isBlockDefArray(value: unknown): value is readonly BlockDef[] {
  return Array.isArray(value) && value.every(isBlockDef);
}

function isDevSyntaxEditorContent(value: unknown): value is DevSyntaxEditorContent {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    typeof value.packId === 'string' &&
    typeof value.lessonId === 'string' &&
    typeof value.title === 'string' &&
    typeof value.prompt === 'string' &&
    typeof value.initialCode === 'string' &&
    typeof value.solutionCode === 'string' &&
    typeof value.fallbackAfterAttempts === 'number' &&
    isAvailableFunctionArray(value.availableFunctions) &&
    isStringArray(value.availableBlocks) &&
    isBlockDefArray(value.blocks)
  );
}

export function loadDevSyntaxEditorContent(): DevSyntaxEditorContent {
  const content: unknown = rawDevSyntaxEditorContent;

  if (!isDevSyntaxEditorContent(content)) {
    throw new Error('Dev syntax editor content is invalid.');
  }

  return content;
}
