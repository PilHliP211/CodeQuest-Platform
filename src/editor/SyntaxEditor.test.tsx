import { useState, type ReactElement } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { SyntaxEditor } from './SyntaxEditor';
import {
  languages as monacoLanguages,
  monacoEditorMock,
  typescript as monacoTypeScript,
} from '@/test/monacoEditorMock';
import type { AvailableFunction } from '@/types/content';
import type * as MonacoEditorMockModule from '@/test/monacoEditorMock';

type MockMonacoApi = typeof MonacoEditorMockModule;

vi.mock('@monaco-editor/react', async () => {
  const ReactActual = await vi.importActual<typeof import('react')>('react');
  const monacoModule =
    await vi.importActual<typeof import('@/test/monacoEditorMock')>('@/test/monacoEditorMock');

  interface MockEditorProps {
    value?: string;
    onChange?: (value: string | undefined) => void;
    beforeMount?: (monaco: MockMonacoApi) => void;
    onMount?: (editor: object, monaco: MockMonacoApi) => void;
    options?: { readOnly?: boolean };
    height?: string;
  }

  function MockEditor({
    value = '',
    onChange,
    beforeMount,
    onMount,
    options,
    height,
  }: MockEditorProps): ReactElement {
    ReactActual.useEffect(() => {
      beforeMount?.(monacoModule);
      onMount?.({}, monacoModule);
    }, [beforeMount, onMount]);

    return ReactActual.createElement('textarea', {
      'aria-label': 'Code editor',
      readOnly: options?.readOnly ?? false,
      value,
      style: { height },
      onChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(event.target.value);
      },
    });
  }

  return {
    default: MockEditor,
    loader: {
      config: monacoModule.monacoEditorMock.loaderConfig,
    },
  };
});

const availableFunctions: readonly AvailableFunction[] = [
  {
    name: 'fillBackground',
    signature: 'fillBackground(color: string)',
    description: 'Fill the entire canvas with a color',
    example: 'fillBackground("white")',
  },
  {
    name: 'drawCircle',
    signature: 'drawCircle(x: number, y: number, radius: number, color: string)',
    description: 'Draw a filled circle at position (x, y)',
    example: 'drawCircle(150, 100, 60, "red")',
  },
];

function ControlledSyntaxEditor(): ReactElement {
  const [code, setCode] = useState('fillBackground("white")');

  return (
    <SyntaxEditor
      value={code}
      onChange={setCode}
      onRun={vi.fn()}
      isRunning={false}
      availableFunctions={availableFunctions}
    />
  );
}

describe('SyntaxEditor', () => {
  beforeEach(() => {
    monacoEditorMock.reset();
  });

  it('lets the learner edit code as a controlled value', async () => {
    const user = userEvent.setup();
    render(<ControlledSyntaxEditor />);

    const editor = screen.getByLabelText(/code editor/i);
    await user.clear(editor);
    await user.type(editor, 'drawCircle()');

    expect(editor).toHaveValue('drawCircle()');
  });

  it('runs the current code when Run is clicked', async () => {
    const handleRun = vi.fn();
    const user = userEvent.setup();
    render(
      <SyntaxEditor
        value={'drawCircle(150, 100, 60, "red")'}
        onChange={vi.fn()}
        onRun={handleRun}
        isRunning={false}
        availableFunctions={availableFunctions}
      />,
    );

    await user.click(screen.getByRole('button', { name: /run/i }));

    expect(handleRun).toHaveBeenCalledWith('drawCircle(150, 100, 60, "red")');
  });

  it('shows read-only code without a Run button', () => {
    render(
      <SyntaxEditor
        value={'fillBackground("white")'}
        onChange={vi.fn()}
        onRun={vi.fn()}
        isRunning={false}
        availableFunctions={availableFunctions}
        readOnly
      />,
    );

    expect(screen.getByLabelText(/code editor/i)).toHaveAttribute('readonly');
    expect(screen.queryByRole('button', { name: /run/i })).not.toBeInTheDocument();
  });

  it('restricts autocomplete to the lesson functions', () => {
    const { unmount } = render(
      <SyntaxEditor
        value=""
        onChange={vi.fn()}
        onRun={vi.fn()}
        isRunning={false}
        availableFunctions={availableFunctions}
      />,
    );

    expect(monacoTypeScript.javascriptDefaults.setDiagnosticsOptions).toHaveBeenCalledWith({
      noSemanticValidation: true,
      noSyntaxValidation: false,
    });
    expect(monacoTypeScript.javascriptDefaults.setCompilerOptions).toHaveBeenCalledWith({
      noLib: true,
      allowNonTsExtensions: true,
    });
    expect(monacoLanguages.registerCompletionItemProvider).toHaveBeenCalledWith(
      'javascript',
      monacoEditorMock.provider.current,
    );

    const provider = monacoEditorMock.provider.current;
    if (provider === null) {
      throw new Error('Expected a completion provider to be registered');
    }

    const completions = provider.provideCompletionItems(
      {
        getWordUntilPosition: () => ({ startColumn: 1, endColumn: 5 }),
      },
      { lineNumber: 1, column: 5 },
    );

    expect(completions.suggestions.map((suggestion) => suggestion.label)).toEqual([
      'fillBackground',
      'drawCircle',
    ]);
    expect(completions.suggestions.map((suggestion) => suggestion.label)).not.toContain('window');

    unmount();

    expect(monacoEditorMock.disposable.dispose).toHaveBeenCalledOnce();
  });
});
