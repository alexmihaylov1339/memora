'use client';

import { Link, usePathname } from '@/i18n/navigation';

import { APP_ROUTES } from '@/shared/constants';

const navigationItems = [
  { label: 'Decks', href: APP_ROUTES.decks, icon: DecksIcon },
  { label: 'Chunks', href: APP_ROUTES.chunks, icon: ChunksIcon },
  { label: 'Cards', href: APP_ROUTES.cards, icon: CardsIcon },
  { label: 'Account', href: APP_ROUTES.account, icon: AccountIcon },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-y-0 left-0 z-20 hidden w-[285px] border-r border-[rgba(1,1,1,0.08)] bg-[rgba(13,43,69,0.02)] px-12 py-10 lg:flex lg:flex-col">
      <Link
        href={APP_ROUTES.home}
        className="mb-16 flex items-center gap-3 self-start"
      >
        <div
          className="flex h-[52px] w-[52px] items-center justify-center rounded-[10px] bg-[#1d6fa5] font-['Vibur'] text-[52px] leading-none text-[#e6f1fb]"
        >
          m
        </div>
        <span className="translate-y-[-1px] font-['Vibur'] text-[54px] leading-none tracking-[0.01em] text-[#1d6fa5]">
          memora
        </span>
      </Link>

      <div className="flex flex-col gap-3">
        {navigationItems.map((item) => {
          const active = isActivePath(pathname, item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? 'flex items-center gap-3 rounded-[14px] px-2 py-3 text-[1rem] font-bold text-[#0D2B45]'
                  : 'flex items-center gap-3 rounded-[14px] px-2 py-3 text-[1rem] font-bold text-[rgba(1,1,1,0.72)] transition hover:text-[#0D2B45]'
              }
            >
              <span
                className={[
                  'flex h-9 w-9 items-center justify-center rounded-[8px] border shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
                  active
                    ? 'border-[#B5D4F4] bg-white text-[#378ADD]'
                    : 'border-[#D5E4F1] bg-white text-[#378ADD]',
                ].join(' ')}
                aria-hidden="true"
              >
                <Icon />
              </span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
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
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
