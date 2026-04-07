'use client';

import { Link, usePathname } from '@/i18n/navigation';

import { APP_ROUTES } from '@/shared/constants';

const navigationItems = [
  { label: 'Decks', href: APP_ROUTES.decks },
  { label: 'Chunks', href: APP_ROUTES.chunks },
  { label: 'Cards', href: APP_ROUTES.cards },
  { label: 'Account', href: APP_ROUTES.account },
] as const;

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function Navigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-y-0 left-0 z-20 hidden w-[285px] border-r border-[rgba(1,1,1,0.08)] bg-[#f6f8fc] px-12 py-10 lg:flex lg:flex-col">
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

          return (
            <Link
              key={item.href}
              href={item.href}
              className={
                active
                  ? 'rounded-[14px] bg-white px-6 py-4 text-[1.15rem] font-semibold text-[#1d6fa5] shadow-[0_10px_24px_rgba(29,111,165,0.08)]'
                  : 'rounded-[14px] px-6 py-4 text-[1.15rem] font-semibold text-[rgba(1,1,1,0.72)] transition hover:bg-white/80 hover:text-[#1d6fa5]'
              }
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
