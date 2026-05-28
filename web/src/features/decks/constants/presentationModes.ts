export const DECK_PRESENTATION_MODE_OPTIONS = [
  { value: 'standard', label: 'Standard' },
  { value: 'kids', label: 'Kids mode' },
] as const;

export type DeckPresentationMode =
  (typeof DECK_PRESENTATION_MODE_OPTIONS)[number]['value'];
