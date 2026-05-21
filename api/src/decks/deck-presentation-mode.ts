import { BadRequestException } from '@nestjs/common';

export const DECK_PRESENTATION_MODES = ['standard', 'kids'] as const;

export type DeckPresentationMode = (typeof DECK_PRESENTATION_MODES)[number];

export function normalizeDeckPresentationMode(
  presentationMode: unknown,
): DeckPresentationMode {
  if (presentationMode === undefined || presentationMode === null) {
    return 'standard';
  }

  if (
    typeof presentationMode !== 'string' ||
    !DECK_PRESENTATION_MODES.includes(
      presentationMode.trim() as DeckPresentationMode,
    )
  ) {
    throw new BadRequestException(
      'presentationMode must be one of: standard, kids',
    );
  }

  return presentationMode.trim() as DeckPresentationMode;
}
