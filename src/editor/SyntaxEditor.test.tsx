import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import type { ChangeEvent, ReactElement } from 'react';
import type { AvailableFunction } from '@/types/content';

const monacoMock = vi.hoisted(() => {
  const registerCompletionItemProvider = vi.fn(() => ({ dispose: vi.fn() }));
  return {
    registerCompletionItemProvider,
  };
});

const loaderMock = vi.hoisted(() => ({
  config: vi.fn(),
}));

interface MockEditorProps {
  value: string;
  onChange?: (value: string | undefined) => void;
  options?: { readOnly?: boolean };
  onMount?: (editor: unknown) => void;
  language?: string;
}

vi.mock('@monaco-editor/react', () => ({
  default: ({ value, onChange, options, onMount, language }: MockEditorProps): ReactElement => {
    onMount?.({});
    return (
      <textarea
        aria-label="Monaco editor"
        data-language={language}
        value={value}
        readOnly={options?.readOnly === true}
        onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange?.(e.target.value)}
      />
    );
  },
  loader: loaderMock,
}));

vi.mock('monaco-editor', () => ({
  languages: {
    CompletionItemKind: { Function: 1 },
    registerCompletionItemProvider: monacoMock.registerCompletionItemProvider,
  },
}));

import { SyntaxEditor } from './SyntaxEditor';

const fillBackground: AvailableFunction = {
  name: 'fillBackground',
  signature: 'fillBackground(color)',
  description: 'Fill the canvas with a solid color.',
  example: 'fillBackground("white")',
};

describe('SyntaxEditor', () => {
  it('shows the current code value to the learner', () => {
    render(
      <SyntaxEditor
        value='fillBackground("white")'
        onChange={vi.fn()}
        availableFunctions={[fillBackground]}
      />,
    );

    expect(screen.getByLabelText('Monaco editor')).toHaveValue('fillBackground("white")');
  });

  it('fires onChange with the new code as the learner types', async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(<SyntaxEditor value="" onChange={handleChange} availableFunctions={[fillBackground]} />);

    await user.type(screen.getByLabelText('Monaco editor'), 'a');

    expect(handleChange).toHaveBeenLastCalledWith('a');
  });

  it('renders the editor as read-only when readOnly is true', () => {
    render(
      <SyntaxEditor value="" onChange={vi.fn()} availableFunctions={[fillBackground]} readOnly />,
    );

    expect(screen.getByLabelText('Monaco editor')).toHaveAttribute('readonly');
  });

  it('registers the restricted completion provider for JavaScript on mount', () => {
    monacoMock.registerCompletionItemProvider.mockClear();

    render(<SyntaxEditor value="" onChange={vi.fn()} availableFunctions={[fillBackground]} />);

    expect(monacoMock.registerCompletionItemProvider).toHaveBeenCalledWith(
      'javascript',
      expect.objectContaining<{ provideCompletionItems: unknown }>({
        provideCompletionItems: expect.any(Function) as unknown,
      }),
    );
  });

  it('disposes the completion provider on unmount so there is no leak between lessons', () => {
    const dispose = vi.fn();
    monacoMock.registerCompletionItemProvider.mockReturnValueOnce({ dispose });

    const { unmount } = render(
      <SyntaxEditor value="" onChange={vi.fn()} availableFunctions={[fillBackground]} />,
    );
    unmount();

    expect(dispose).toHaveBeenCalled();
  });
});
