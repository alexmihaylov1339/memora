import type { ElementType } from 'react';

export interface TranslationProps
  extends Omit<React.HTMLAttributes<HTMLElement>, 'children'> {
  /**
   * Translation key from locale JSON files
   * Example: "decks.title" or "common.loading"
   */
  tKey: string;

  /**
   * HTML element to render (h1, p, span, div, etc.)
   * @default "span"
   */
  as?: ElementType;

  /**
   * Values for interpolation in translations
   * Example: { name: "My Deck" } for "Deck {name} created"
   */
  values?: Record<string, string | number>;

  /**
   * CSS class name
   */
  className?: string;
}

