import { useEffect, useRef, useState } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monacoEditor from 'monaco-editor';
import { RunButton } from './RunButton';
import { createCompletionEntries } from './completionItems';
import type { AvailableFunction } from '@/types/content';

export interface SyntaxEditorProps {
  value: string;
  onChange: (code: string) => void;
  onRun: (code: string) => void;
  isRunning: boolean;
  availableFunctions: readonly AvailableFunction[];
  readOnly?: boolean;
  height?: string;
}

loader.config({ monaco: monacoEditor });

const BASE_EDITOR_OPTIONS: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
  theme: 'vs-dark',
  fontFamily: '"Fira Code", monospace',
  fontSize: 14,
  fontLigatures: true,
  lineNumbers: 'on',
  minimap: { enabled: false },
  scrollBeyondLastLine: false,
  wordWrap: 'on',
  tabSize: 2,
  automaticLayout: true,
};

type MonacoApi = typeof monacoEditor;

interface JavaScriptDefaults {
  setDiagnosticsOptions: (options: {
    noSemanticValidation: boolean;
    noSyntaxValidation: boolean;
  }) => void;
  setCompilerOptions: (options: { noLib: boolean; allowNonTsExtensions: boolean }) => void;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function isJavaScriptDefaults(value: unknown): value is JavaScriptDefaults {
  return (
    isRecord(value) &&
    typeof value.setDiagnosticsOptions === 'function' &&
    typeof value.setCompilerOptions === 'function'
  );
}

function findJavaScriptDefaults(monaco: MonacoApi): JavaScriptDefaults | null {
  const monacoRecord: unknown = monaco;

  if (isRecord(monacoRecord)) {
    const topLevelTypeScript = monacoRecord.typescript;
    if (
      isRecord(topLevelTypeScript) &&
      isJavaScriptDefaults(topLevelTypeScript.javascriptDefaults)
    ) {
      return topLevelTypeScript.javascriptDefaults;
    }
  }

  const languageNamespaces: unknown = monaco.languages;
  if (!isRecord(languageNamespaces)) {
    return null;
  }

  const legacyTypeScript = languageNamespaces.typescript;
  if (isRecord(legacyTypeScript) && isJavaScriptDefaults(legacyTypeScript.javascriptDefaults)) {
    return legacyTypeScript.javascriptDefaults;
  }

  return null;
}

function configureJavaScriptDefaults(monaco: MonacoApi): void {
  const javaScriptDefaults = findJavaScriptDefaults(monaco);
  if (javaScriptDefaults === null) {
    return;
  }

  javaScriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: false,
  });
  javaScriptDefaults.setCompilerOptions({
    noLib: true,
    allowNonTsExtensions: true,
  });
}

/**
 * Monaco must stay behind a React.lazy boundary at the call site:
 * React.lazy(() => import('./SyntaxEditor').then((m) => ({ default: m.SyntaxEditor }))).
 */
export function SyntaxEditor({
  value,
  onChange,
  onRun,
  isRunning,
  availableFunctions,
  readOnly = false,
  height = '400px',
}: SyntaxEditorProps): React.ReactElement {
  const editorRef = useRef<monacoEditor.editor.IStandaloneCodeEditor | null>(null);
  const [monacoApi, setMonacoApi] = useState<MonacoApi | null>(null);

  useEffect(() => {
    if (monacoApi === null) {
      return undefined;
    }

    const completionProvider: monacoEditor.languages.CompletionItemProvider = {
      provideCompletionItems(model, position) {
        const word = model.getWordUntilPosition(position);
        const range: monacoEditor.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };
        const suggestions: monacoEditor.languages.CompletionItem[] = createCompletionEntries(
          availableFunctions,
        ).map((entry) => ({
          label: entry.label,
          kind: monacoApi.languages.CompletionItemKind.Function,
          detail: entry.detail,
          documentation: entry.documentation,
          insertText: entry.insertText,
          range,
        }));

        return { suggestions };
      },
    };

    const disposable = monacoApi.languages.registerCompletionItemProvider(
      'javascript',
      completionProvider,
    );

    return () => {
      disposable.dispose();
    };
  }, [availableFunctions, monacoApi]);

  const handleBeforeMount = (monaco: MonacoApi): void => {
    configureJavaScriptDefaults(monaco);
  };

  const handleMount = (
    editorInstance: monacoEditor.editor.IStandaloneCodeEditor,
    monaco: MonacoApi,
  ): void => {
    editorRef.current = editorInstance;
    setMonacoApi(monaco);
  };

  const editorOptions: monacoEditor.editor.IStandaloneEditorConstructionOptions = {
    ...BASE_EDITOR_OPTIONS,
    readOnly,
  };

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="min-h-80 overflow-hidden rounded border-4 border-gray-950 bg-gray-950">
        <Editor
          language="javascript"
          theme="vs-dark"
          value={value}
          height={height}
          options={editorOptions}
          beforeMount={handleBeforeMount}
          onMount={handleMount}
          onChange={(nextValue) => {
            onChange(nextValue ?? '');
          }}
        />
      </div>
      {!readOnly && (
        <div className="flex justify-end">
          <RunButton
            isRunning={isRunning}
            onRun={() => {
              onRun(value);
            }}
          />
        </div>
      )}
    </div>
  );
}
