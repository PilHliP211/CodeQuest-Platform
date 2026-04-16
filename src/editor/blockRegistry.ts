import * as Blockly from 'blockly/core';
import { javascriptGenerator } from 'blockly/javascript';
import type { BlockDef } from '@/types/content';

const DEFAULT_BLOCK_STYLE = 'movement_blocks';

/** Maps content-pack category names to Blockly block style keys. */
const CATEGORY_STYLE_MAP: Record<string, string> = {
  Movement: 'movement_blocks',
  'Search / Collect': 'search_blocks',
  Drawing: 'drawing_blocks',
  Logic: 'logic_blocks',
  Loops: 'loop_blocks',
  Functions: 'function_blocks',
};

/**
 * Registers lesson block definitions with Blockly's block factory and static
 * code generator. The generated code is pre-authored content-pack text only.
 *
 * When `showCode` is true (Phase 2), each block gets a second message row
 * containing the `BlockDef.code` field so learners can see the actual code
 * their block represents.
 */
export function registerBlocks(blocks: readonly BlockDef[], showCode = false): void {
  const blocklyDefs = blocks.map((def) => {
    const { colour: _colour, ...blocklyDefWithoutColour } = def.blocklyDef;

    const blocklyDef: Record<string, unknown> = {
      ...blocklyDefWithoutColour,
      type: def.id,
      style: CATEGORY_STYLE_MAP[def.category] ?? DEFAULT_BLOCK_STYLE,
    };

    if (showCode) {
      blocklyDef.message1 = def.code;
      blocklyDef.args1 = [];
    }

    return blocklyDef;
  });

  Blockly.defineBlocksWithJsonArray(blocklyDefs);

  for (const def of blocks) {
    javascriptGenerator.forBlock[def.id] = () => `${def.code}\n`;
  }
}
