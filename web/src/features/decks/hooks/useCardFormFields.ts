import { useMemo } from 'react';
import type { FieldConfig } from '@shared/components';
import {
  getCardKindFields,
  type SupportedCardKind,
} from '../card-kinds';

export function useCardFormFields(kind: SupportedCardKind): FieldConfig[] {
  const kindFields = useMemo(() => getCardKindFields(kind), [kind]);

  return useMemo<FieldConfig[]>(() => kindFields, [kindFields]);
}

export function useCreateCardFormFields(kind: SupportedCardKind): FieldConfig[] {
  return useCardFormFields(kind);
}

export function useEditCardFormFields(kind: SupportedCardKind): FieldConfig[] {
  return useCardFormFields(kind);
}
