import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ChangeEvent, ReactElement } from 'react';

vi.mock('./BlockEditor', () => ({
  BlockEditor: ({ phase }: { phase: 1 | 2 | 3 }): ReactElement => (
    <div data-testid="mock-block-editor" data-phase={phase.toString()}>
      Block editor phase {phase}
    </div>
  ),
}));

interface MockEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  options?: { readOnly?: boolean };
}

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, options }: MockEditorProps): ReactElement => (
    <textarea
      aria-label="Monaco editor"
      value={value}
      readOnly={options?.readOnly === true}
      onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
    />
  ),
  loader: { config: vi.fn() },
}));

vi.mock('monaco-editor', () => ({
  languages: {
    CompletionItemKind: { Function: 1 },
    registerCompletionItemProvider: vi.fn(() => ({ dispose: vi.fn() })),
  },
}));

import { EditorToggle, type EditorToggleProps } from './EditorToggle';

function makeProps(overrides: Partial<EditorToggleProps> = {}): EditorToggleProps {
  return {
    activeView: 'syntax',
    onViewChange: vi.fn(),
    syntaxEditorProps: {
      value: '',
      onChange: vi.fn(),
      availableFunctions: [],
    },
    blockEditorProps: {
      blockDefs: [],
      availableBlocks: [],
      isRunning: false,
      onCodeGenerated: vi.fn(),
    },
    ...overrides,
  };
}

describe('EditorToggle', () => {
  it('defaults to the code view and marks the Code tab as selected', async () => {
    render(<EditorToggle {...makeProps()} />);

    expect(await screen.findByRole('tab', { name: /code/i })).toHaveAttribute(
      'aria-selected',
      'true',
    );
    expect(screen.getByRole('tab', { name: /blocks/i })).toHaveAttribute('aria-selected', 'false');
  });

  it('labels the blocks tab as view-only so learners know they cannot run from it', () => {
    render(<EditorToggle {...makeProps()} />);

    expect(screen.getByRole('tab', { name: /blocks/i })).toHaveTextContent(/view only/i);
  });

  it('fires onViewChange with "blocks" when the learner clicks the Blocks tab', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(<EditorToggle {...makeProps({ onViewChange })} />);

    await user.click(screen.getByRole('tab', { name: /blocks/i }));

    expect(onViewChange).toHaveBeenCalledWith('blocks');
  });

  it('moves selection between tabs with the arrow keys', async () => {
    const user = userEvent.setup();
    const onViewChange = vi.fn();
    render(<EditorToggle {...makeProps({ onViewChange })} />);

    const codeTab = screen.getByRole('tab', { name: /code/i });
    codeTab.focus();
    await user.keyboard('{ArrowRight}');

    expect(onViewChange).toHaveBeenCalledWith('blocks');
  });

  it('shows the read-only reference message when the blocks panel is visible', () => {
    render(<EditorToggle {...makeProps({ activeView: 'blocks' })} />);

    expect(screen.getByRole('note')).toHaveTextContent(/read-only in phase 3/i);
  });

  it('always renders the read-only BlockEditor at phase 3', () => {
    render(<EditorToggle {...makeProps()} />);

    expect(screen.getByTestId('mock-block-editor')).toHaveAttribute('data-phase', '3');
  });

  it('keeps both panels mounted so Monaco does not reinitialize on tab switch', async () => {
    render(<EditorToggle {...makeProps({ activeView: 'syntax' })} />);

    // Monaco editor renders inside the syntax panel (visible), BlockEditor
    // inside the blocks panel (hidden) — but both are in the DOM.
    expect(await screen.findByLabelText('Monaco editor')).toBeInTheDocument();
    expect(screen.getByTestId('mock-block-editor')).toBeInTheDocument();
  });
});
