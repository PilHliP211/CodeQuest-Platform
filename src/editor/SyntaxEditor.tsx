import { useEffect, useRef } from 'react';
import Editor, { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { buildSyntaxCompletions } from './syntaxCompletions';
import type { ReactElement } from 'react';
import type { AvailableFunction } from '@/types/content';

/**
 * Monaco-backed code editor used in Phase 3 lessons.
 *
 * Usage note: this component bundles Monaco (~2 MB). Import it through
 * `React.lazy` at call sites so it is only fetched when a Phase 3 lesson is
 * actually entered:
 *
 *   const SyntaxEditor = React.lazy(() =>
 *     import('./SyntaxEditor').then((m) => ({ default: m.SyntaxEditor })),
 *   );
 *   // Then wrap usage in <React.Suspense fallback={<LoadingSpinner />}>
 */

// Force @monaco-editor/react to use the bundled `monaco-editor` package
// rather than fetching Monaco from a CDN at runtime.
//
// Side note on JavaScript IntelliSense suppression: the `monaco-editor` ESM
// build does not activate its TypeScript/JavaScript language services unless
// the consumer explicitly imports `monaco-editor/esm/vs/language/typescript/...`.
// Because we never import that module, built-in completions for `window`,
// `console`, DOM APIs, etc. never appear — the only completion source is the
// restricted provider registered below. If a future epic needs TS services
// (type-checking, signature help), re-introduce the suppression there.
loader.config({ monaco });

const EDITOR_OPTIONS: monaco.editor.IStandaloneEditorConstructionOptions = {
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

export interface SyntaxEditorProps {
  value: string;
  onChange: (code: string) => void;
  availableFunctions: readonly AvailableFunction[];
  readOnly?: boolean;
  height?: string;
}

export function SyntaxEditor({
  value,
  onChange,
  availableFunctions,
  readOnly = false,
  height = '400px',
}: SyntaxEditorProps): ReactElement {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);

  useEffect(() => {
    const completions = buildSyntaxCompletions(availableFunctions);

    const disposable = monaco.languages.registerCompletionItemProvider('javascript', {
      provideCompletionItems(model, position) {
        const word = model.getWordUntilPosition(position);
        const range: monaco.IRange = {
          startLineNumber: position.lineNumber,
          endLineNumber: position.lineNumber,
          startColumn: word.startColumn,
          endColumn: word.endColumn,
        };

        const suggestions: monaco.languages.CompletionItem[] = completions.map((c) => ({
          label: c.label,
          kind: monaco.languages.CompletionItemKind.Function,
          detail: c.detail,
          documentation: c.documentation,
          insertText: c.insertText,
          range,
        }));

        return { suggestions };
      },
    });

    return () => {
      disposable.dispose();
    };
  }, [availableFunctions]);

  function handleMount(editor: monaco.editor.IStandaloneCodeEditor): void {
    editorRef.current = editor;
  }

  function handleChange(next: string | undefined): void {
    onChange(next ?? '');
  }

  return (
    <div style={{ height }} aria-label="Code editor">
      <Editor
        language="javascript"
        value={value}
        onChange={handleChange}
        onMount={handleMount}
        options={{ ...EDITOR_OPTIONS, readOnly }}
      />
    </div>
  );
}
