import type { AvailableFunction } from '@/types/content';

export interface CompletionEntry {
  label: string;
  detail: string;
  documentation: string;
  insertText: string;
}

export function createCompletionEntries(
  availableFunctions: readonly AvailableFunction[],
): CompletionEntry[] {
  return availableFunctions.map((availableFunction) => ({
    label: availableFunction.name,
    detail: availableFunction.signature,
    documentation: availableFunction.description,
    insertText: `${availableFunction.name}()`,
  }));
}
