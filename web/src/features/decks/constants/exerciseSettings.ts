import type { DeckExerciseSettings } from '../types';

export const DEFAULT_WHAT_DID_YOU_HEAR_CHOICE_COUNT = 4;

export const DEFAULT_DECK_EXERCISE_SETTINGS: DeckExerciseSettings = {
  whatDidYouHear: {
    choiceCount: DEFAULT_WHAT_DID_YOU_HEAR_CHOICE_COUNT,
  },
};

export const WHAT_DID_YOU_HEAR_CHOICE_COUNT_OPTIONS = [
  { value: '2', label: '2' },
  { value: '3', label: '3' },
  { value: '4', label: '4' },
] as const;
