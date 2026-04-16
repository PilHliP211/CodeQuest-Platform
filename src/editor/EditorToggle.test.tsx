import { useState, type ReactElement } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { EditorToggle, type EditorView } from './EditorToggle';
import type { AvailableFunction, BlockDef } from '@/types/content';

vi.mock('./SyntaxEditor', () => ({
  SyntaxEditor: () => <div>syntax editor surface</div>,
}));

vi.mock('./BlockEditor', () => ({
  BlockEditor: ({ phase }: { phase: 1 | 2 | 3 }) => <div>block editor phase {phase}</div>,
}));

const availableFunctions: readonly AvailableFunction[] = [
  {
    name: 'fillBackground',
    signature: 'fillBackground(color: string)',
    description: 'Fill the entire canvas with a color',
    example: 'fillBackground("white")',
  },
];

const blockDefs: readonly BlockDef[] = [
  {
    id: 'fillBackground',
    label: 'Fill Background',
    category: 'Drawing',
    color: 20,
    code: 'fillBackground("white")',
    blocklyDef: {
      type: 'fillBackground',
      message0: 'Fill background',
      previousStatement: null,
      nextStatement: null,
      colour: 20,
      tooltip: 'Fill the flag',
      helpUrl: '',
    },
  },
];

interface ToggleHarnessProps {
  failedAttempts?: number;
}

function ToggleHarness({ failedAttempts = 0 }: ToggleHarnessProps): ReactElement {
  const [activeView, setActiveView] = useState<EditorView>('syntax');

  return (
    <EditorToggle
      activeView={activeView}
      onViewChange={setActiveView}
      failedAttempts={failedAttempts}
      fallbackAfterAttempts={3}
      syntaxEditorProps={{
        value: '',
        onChange: vi.fn(),
        onRun: vi.fn(),
        isRunning: false,
        availableFunctions,
      }}
      blockEditorProps={{
        blockDefs,
        availableBlocks: ['fillBackground'],
        onCodeGenerated: vi.fn(),
        isRunning: false,
      }}
    />
  );
}

describe('EditorToggle', () => {
  it('renders Code as the active Phase 3 editor view', async () => {
    render(<ToggleHarness />);

    expect(screen.getByRole('tab', { name: /^code$/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: /blocks/i })).toHaveTextContent('view only');
    expect(await screen.findByText('syntax editor surface')).toBeVisible();
  });

  it('switches to the read-only blocks reference', async () => {
    const user = userEvent.setup();
    render(<ToggleHarness />);

    await user.click(screen.getByRole('tab', { name: /blocks/i }));

    expect(screen.getByRole('tab', { name: /blocks/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/blocks view is read-only in phase 3/i)).toBeInTheDocument();
    expect(screen.getByText('block editor phase 3')).toBeVisible();
  });

  it('shows the blocks fallback after repeated failed attempts', async () => {
    const user = userEvent.setup();
    render(<ToggleHarness failedAttempts={3} />);

    await user.click(screen.getByRole('button', { name: /need help/i }));

    expect(screen.getByRole('tab', { name: /blocks/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByText(/blocks view is read-only in phase 3/i)).toBeInTheDocument();
  });

  it('supports arrow-key tab navigation', async () => {
    const user = userEvent.setup();
    render(<ToggleHarness />);

    screen.getByRole('tab', { name: /^code$/i }).focus();
    await user.keyboard('{ArrowRight}');

    expect(screen.getByRole('tab', { name: /blocks/i })).toHaveFocus();
    expect(screen.getByRole('tab', { name: /blocks/i })).toHaveAttribute('aria-selected', 'true');
  });
});
