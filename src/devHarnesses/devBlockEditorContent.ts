import rawDevBlockEditorContent from '../../content/flag-hunter/dev-harnesses/dev-block-editor.json';
import type { BlockDef } from '@/types/content';

export interface DevBlockEditorContent {
  title: string;
  availableBlocks: readonly string[];
  blocks: readonly BlockDef[];
}

function isNonNullObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isStringArray(value: unknown): value is readonly string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
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

function isDevBlockEditorContent(value: unknown): value is DevBlockEditorContent {
  if (!isNonNullObject(value)) {
    return false;
  }

  return (
    typeof value.title === 'string' &&
    isStringArray(value.availableBlocks) &&
    isBlockDefArray(value.blocks)
  );
}

export function loadDevBlockEditorContent(): DevBlockEditorContent {
  const content: unknown = rawDevBlockEditorContent;

  if (!isDevBlockEditorContent(content)) {
    throw new Error('Dev block editor content is invalid.');
  }

  return content;
}
