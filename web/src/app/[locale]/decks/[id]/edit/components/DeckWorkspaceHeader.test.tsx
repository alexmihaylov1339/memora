import { render, screen } from '@testing-library/react';
import type React from 'react';

import DeckWorkspaceHeader from './DeckWorkspaceHeader';

jest.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string | { pathname: string; query?: Record<string, string> };
    className?: string;
  }) => {
    const resolvedHref =
      typeof href === 'string'
        ? href
        : `${href.pathname}?deckId=${href.query?.deckId ?? ''}`;

    return (
      <a href={resolvedHref} className={className}>
        {children}
      </a>
    );
  },
}));

describe('DeckWorkspaceHeader', () => {
  it('links review and practice actions to the selected deck', () => {
    render(<DeckWorkspaceHeader deckId="deck-1" />);

    expect(screen.getByRole('link', { name: 'Start Review' })).toHaveAttribute(
      'href',
      '/review?deckId=deck-1',
    );
    expect(screen.getByRole('link', { name: 'Practice Deck' })).toHaveAttribute(
      'href',
      '/practice?deckId=deck-1',
    );
  });
});
