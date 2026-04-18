import { vi } from 'vitest';

interface MockPosition {
  lineNumber: number;
  column: number;
}

interface MockWord {
  startColumn: number;
  endColumn: number;
}

interface MockModel {
  getWordUntilPosition: (position: MockPosition) => MockWord;
}

export interface MockCompletionProvider {
  provideCompletionItems: (
    model: MockModel,
    position: MockPosition,
  ) => { suggestions: readonly { label: string; detail: string; documentation: string }[] };
}

const provider = { current: null as MockCompletionProvider | null };
const disposable = { dispose: vi.fn() };

export const typescript = {
  javascriptDefaults: {
    setDiagnosticsOptions: vi.fn(),
    setCompilerOptions: vi.fn(),
  },
};

export const languages = {
  CompletionItemKind: {
    Function: 1,
  },
  registerCompletionItemProvider: vi.fn(
    (_language: string, completionProvider: MockCompletionProvider) => {
      provider.current = completionProvider;
      return disposable;
    },
  ),
};

export const editor = {};

export const monacoEditorMock = {
  provider,
  disposable,
  loaderConfig: vi.fn(),
  reset(): void {
    provider.current = null;
    disposable.dispose.mockClear();
    this.loaderConfig.mockClear();
    languages.registerCompletionItemProvider.mockClear();
    typescript.javascriptDefaults.setDiagnosticsOptions.mockClear();
    typescript.javascriptDefaults.setCompilerOptions.mockClear();
  },
};
