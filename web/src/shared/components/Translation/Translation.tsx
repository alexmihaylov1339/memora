'use client';

import { useTranslations } from 'next-intl';
import type { TranslationProps } from './types';

/**
 * Translate component - replaces all text elements (h1, p, span, etc.)
 * Usage: <Translate tKey="decks.title" as="h1" />
 * Usage with interpolation: <Translate tKey="decks.createSuccess" values={{ name: "My Deck" }} />
 */
export default function Translation({
  tKey,
  as: Component = 'span',
  values,
  className,
  ...rest
}: TranslationProps) {
  const t = useTranslations();

  return (
    <Component className={className} {...rest}>
      {t(tKey, values)}
    </Component>
  );
}

