import type { AvailableFunction } from '@/types/content';

/**
 * A plain representation of a Monaco completion item — kept pure so it can be
 * unit-tested without importing Monaco. The `SyntaxEditor` adapts these into
 * real `monaco.languages.CompletionItem` values at registration time.
 */
export interface SyntaxCompletion {
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
}

/**
 * Build completion items for the restricted autocomplete provider.
 * The learner only ever sees functions that come from the lesson's
 * `availableFunctions` — nothing from the built-in JavaScript lib.
 */
export function buildSyntaxCompletions(
  availableFunctions: readonly AvailableFunction[],
): SyntaxCompletion[] {
  return availableFunctions.map((fn) => ({
    label: fn.name,
    detail: fn.signature,
    documentation: fn.description,
    insertText: `${fn.name}()`,
  }));
}
