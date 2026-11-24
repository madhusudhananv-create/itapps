import { useContext } from 'react';
import {
  AimiLookupContext,
  type AimiLookupContextValue,
} from './AimiLookupContext';

export const useAimiLookupData = (): AimiLookupContextValue => {
  const context = useContext(AimiLookupContext);
  if (context === undefined) {
    throw new Error(
      'useAimiLookupData must be used within an AimiLookupProvider'
    );
  }
  return context;
};
