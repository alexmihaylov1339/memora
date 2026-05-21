import { render, screen } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import DecksWorkspace from './DecksWorkspace';

const mockReplace = jest.fn();

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

jest.mock('@/i18n/navigation', () => ({
  Link: ({ children, href, ...props }: MockLinkProps) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({ replace: mockReplace }),
}));

jest.mock('@/features/auth/account/hooks', () => ({
  useGetCurrentUser: () => ({
    data: { name: 'Alex', email: 'alex@example.com' },
  }),
}));

describe('DecksWorkspace', () => {
  it('shows total cards and due cards as separate deck grid columns', () => {
    render(
      <DecksWorkspace
        decks={[
          {
            id: 'deck-1',
            name: 'Spanish',
            count: 12,
            dueCount: 3,
            presentationMode: 'standard',
          },
          {
            id: 'deck-2',
            name: 'German',
            count: 5,
            dueCount: 0,
            presentationMode: 'kids',
          },
        ]}
      />,
    );

    expect(
      screen.getByText("3 Cards due today. Don't let them pile up!"),
    ).toBeInTheDocument();
    expect(screen.getByRole('columnheader', { name: 'Cards' })).toBeInTheDocument();
    expect(
      screen.getByRole('columnheader', { name: 'Due cards' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '12' })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: '3' })).toBeInTheDocument();
  });
});
