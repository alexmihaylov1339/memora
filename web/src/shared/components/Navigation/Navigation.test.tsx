import { fireEvent, render, screen, within } from '@testing-library/react';
import type { AnchorHTMLAttributes, ReactNode } from 'react';

import Navigation from './Navigation';

type MockLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  href: string;
};

jest.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
    onClick,
    ...props
  }: MockLinkProps) => (
    <a href={href} onClick={onClick} {...props}>
      {children}
    </a>
  ),
  usePathname: () => '/decks',
}));

describe('Navigation', () => {
  it('renders a collapsed hamburger trigger for mobile navigation', () => {
    render(<Navigation />);

    const menuButton = screen.getByRole('button', {
      name: 'Open navigation menu',
    });

    expect(menuButton).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.queryByRole('dialog', { name: 'Navigation menu' }),
    ).not.toBeInTheDocument();
  });

  it('opens and closes the mobile navigation drawer', () => {
    render(<Navigation />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    );

    expect(
      screen.getByRole('dialog', { name: 'Navigation menu' }),
    ).toBeInTheDocument();

    const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
    fireEvent.click(
      within(dialog).getByRole('button', { name: 'Close navigation menu' }),
    );

    expect(
      screen.queryByRole('dialog', { name: 'Navigation menu' }),
    ).not.toBeInTheDocument();
  });

  it('closes the mobile drawer after a navigation link is selected', () => {
    render(<Navigation />);

    fireEvent.click(
      screen.getByRole('button', { name: 'Open navigation menu' }),
    );

    const dialog = screen.getByRole('dialog', { name: 'Navigation menu' });
    fireEvent.click(within(dialog).getByRole('link', { name: /cards/i }));

    expect(
      screen.queryByRole('dialog', { name: 'Navigation menu' }),
    ).not.toBeInTheDocument();
  });
});
