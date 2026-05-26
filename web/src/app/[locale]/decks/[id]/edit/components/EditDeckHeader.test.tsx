import { render, screen } from '@testing-library/react';
import type React from 'react';

import EditDeckHeader from './EditDeckHeader';

jest.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

describe('EditDeckHeader', () => {
  it('shows kids/public deck cues and quick actions', () => {
    render(
      <EditDeckHeader
        deckId="deck-1"
        deckName="Kids Cars"
        isPublic
        presentationMode="kids"
      />,
    );

    expect(screen.getByText('Kids mode')).toBeInTheDocument();
    expect(screen.getByText('Public deck')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Open Kids Mode' })).toHaveAttribute(
      'href',
      '/practice?deckId=deck-1',
    );
    expect(screen.getByRole('link', { name: 'Browse Public Decks' })).toHaveAttribute(
      'href',
      '/public-decks',
    );
  });

  it('keeps review as the primary quick action for standard decks', () => {
    render(<EditDeckHeader deckId="deck-2" presentationMode="standard" />);

    expect(screen.getByRole('link', { name: 'Review Due Cards' })).toHaveAttribute(
      'href',
      '/review?deckId=deck-2',
    );
  });
});
