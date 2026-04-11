import { useContext } from 'react';
import { ContentContext, type ContentContextValue } from './ContentContext';

export function useContent(): ContentContextValue {
  const ctx = useContext(ContentContext);
  if (ctx === undefined) {
    throw new Error(
      'useContent must be used within <ContentProvider> and requires a successfully loaded content pack.',
    );
  }
  return ctx;
}
