import * as Blockly from 'blockly/core';

/**
 * CodeQuest pixel-art Blockly theme.
 * Blockly version: 12.5.1.
 *
 * Content categories map to block style keys this way:
 * Movement -> movement_blocks
 * Search / Collect -> search_blocks
 * Drawing -> drawing_blocks
 * Logic -> logic_blocks
 * Loops -> loop_blocks
 * Functions -> function_blocks
 */
export const codeQuestTheme = Blockly.Theme.defineTheme('codequest', {
  name: 'codequest',
  base: Blockly.Themes.Classic,
  blockStyles: {
    movement_blocks: { colourPrimary: '160', colourSecondary: '120', colourTertiary: '90' },
    search_blocks: { colourPrimary: '210', colourSecondary: '180', colourTertiary: '150' },
    drawing_blocks: { colourPrimary: '20', colourSecondary: '350', colourTertiary: '330' },
    logic_blocks: { colourPrimary: '210', colourSecondary: '180', colourTertiary: '150' },
    loop_blocks: { colourPrimary: '120', colourSecondary: '90', colourTertiary: '60' },
    function_blocks: { colourPrimary: '290', colourSecondary: '260', colourTertiary: '230' },
  },
  categoryStyles: {
    movement_blocks: { colour: '160' },
    search_blocks: { colour: '210' },
    drawing_blocks: { colour: '20' },
    logic_blocks: { colour: '210' },
    loop_blocks: { colour: '120' },
    function_blocks: { colour: '290' },
  },
  componentStyles: {
    workspaceBackgroundColour: '#1a1a2e',
    toolboxBackgroundColour: '#16213e',
    toolboxForegroundColour: '#e0e0e0',
    flyoutBackgroundColour: '#0f3460',
    flyoutForegroundColour: '#e0e0e0',
    flyoutOpacity: 0.95,
    scrollbarColour: '#4a4a6a',
    scrollbarOpacity: 0.4,
    insertionMarkerColour: '#ffffff',
    insertionMarkerOpacity: 0.3,
    cursorColour: '#ffffff',
  },
  fontStyle: {
    family: '"Press Start 2P", monospace',
    weight: 'normal',
    size: 8,
  },
  startHats: false,
});
