import { DEFAULT_DECK_EXERCISE_SETTINGS } from '../constants/exerciseSettings';
import type { DeckPresentationMode } from '../constants/presentationModes';
import type {
  Deck,
  DeckDetail,
  DeckExerciseSettings,
  DeckRecord,
  PublicDeckRecord,
} from '../types';

interface DeckResponseShape {
  presentationMode?: DeckPresentationMode | null;
  isPublic?: boolean | null;
  exerciseSettings?: unknown;
  isWhatDidYouHearEligible?: boolean | null;
  whatDidYouHearEligibleCardCount?: number | null;
}

interface DeckListItemResponse extends DeckResponseShape {
  id: string;
  name: string;
  count: number;
  dueCount?: number | null;
}

function isChoiceCount(value: unknown): value is 2 | 3 | 4 {
  return value === 2 || value === 3 || value === 4;
}

export function resolveDeckExerciseSettings(
  value: unknown,
): DeckExerciseSettings {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) {
    return DEFAULT_DECK_EXERCISE_SETTINGS;
  }

  const record = value as Record<string, unknown>;
  const whatDidYouHear = record.whatDidYouHear;
  if (
    typeof whatDidYouHear !== 'object' ||
    whatDidYouHear === null ||
    Array.isArray(whatDidYouHear)
  ) {
    return DEFAULT_DECK_EXERCISE_SETTINGS;
  }

  const choiceCount = (whatDidYouHear as Record<string, unknown>).choiceCount;
  if (!isChoiceCount(choiceCount)) {
    return DEFAULT_DECK_EXERCISE_SETTINGS;
  }

  return {
    whatDidYouHear: {
      choiceCount,
    },
  };
}

function resolveDeckResponseShape<T extends DeckResponseShape>(
  deck: T,
): T & {
  presentationMode: DeckPresentationMode;
  isPublic: boolean;
  exerciseSettings: DeckExerciseSettings;
  isWhatDidYouHearEligible: boolean;
  whatDidYouHearEligibleCardCount: number;
} {
  const eligibleCardCount = Math.max(
    0,
    deck.whatDidYouHearEligibleCardCount ?? 0,
  );

  return {
    ...deck,
    presentationMode: deck.presentationMode ?? 'standard',
    isPublic: deck.isPublic ?? false,
    exerciseSettings: resolveDeckExerciseSettings(deck.exerciseSettings),
    isWhatDidYouHearEligible:
      deck.isWhatDidYouHearEligible ?? eligibleCardCount >= 2,
    whatDidYouHearEligibleCardCount: eligibleCardCount,
  };
}

export function mapDeckListResponse(decks: DeckListItemResponse[]): Deck[] {
  return decks.map((deck) => ({
    ...resolveDeckResponseShape(deck),
    dueCount: deck.dueCount ?? 0,
  }));
}

export function mapDeckRecordResponse(deck: DeckRecord): DeckRecord {
  return resolveDeckResponseShape(deck);
}

export function mapDeckDetailResponse(deck: DeckDetail): DeckDetail {
  return resolveDeckResponseShape(deck);
}

export function mapPublicDeckListResponse(
  decks: PublicDeckRecord[],
): PublicDeckRecord[] {
  return decks.map((deck) => resolveDeckResponseShape(deck));
}
