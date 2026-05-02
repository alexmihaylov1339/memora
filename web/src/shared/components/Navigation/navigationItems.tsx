import { APP_ROUTES } from '@/shared/constants';

export const navigationItems = [
  { label: 'Decks', href: APP_ROUTES.decks, icon: DecksIcon },
  { label: 'Chunks', href: APP_ROUTES.chunks, icon: ChunksIcon },
  { label: 'Cards', href: APP_ROUTES.cards, icon: CardsIcon },
  { label: 'Account', href: APP_ROUTES.account, icon: AccountIcon },
] as const;

export function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

function DecksIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.5" y="3.5" width="13" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 3.5V14.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function ChunksIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="2.5" y="2.5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5.5 6H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 9H12.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5.5 12H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function CardsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="11" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 7H12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M6 10H10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function AccountIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4 14.5C4.8 12.5 6.6 11.5 9 11.5C11.4 11.5 13.2 12.5 14 14.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}
