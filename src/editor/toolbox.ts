import type { BlockDef } from '@/types/content';

interface ToolboxBlock {
  kind: 'block';
  type: string;
}

interface ToolboxCategory {
  kind: 'category';
  name: string;
  contents: ToolboxBlock[];
}

export interface CategoryToolbox {
  kind: 'categoryToolbox';
  contents: ToolboxCategory[];
}

export function createToolboxDefinition(
  blockIds: readonly string[],
  blockDefs: readonly BlockDef[],
): CategoryToolbox {
  const definitionsById = new Map(blockDefs.map((blockDef) => [blockDef.id, blockDef]));
  const categories = new Map<string, ToolboxBlock[]>();

  for (const id of blockIds) {
    const definition = definitionsById.get(id);

    if (definition === undefined) {
      console.warn(`Block "${id}" is listed as available but has no matching block definition.`);
      continue;
    }

    const categoryBlocks = categories.get(definition.category);
    const block = { kind: 'block', type: id } satisfies ToolboxBlock;

    if (categoryBlocks === undefined) {
      categories.set(definition.category, [block]);
    } else {
      categoryBlocks.push(block);
    }
  }

  return {
    kind: 'categoryToolbox',
    contents: Array.from(categories.entries()).map(([name, contents]) => ({
      kind: 'category',
      name,
      contents,
    })),
  };
}
