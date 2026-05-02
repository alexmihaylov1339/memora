'use client';

import { Link, usePathname } from '@/i18n/navigation';

import { isActivePath, navigationItems } from './navigationItems';

interface NavigationLinksProps {
  onNavigate?: () => void;
}

export default function NavigationLinks({ onNavigate }: NavigationLinksProps) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col gap-3">
      {navigationItems.map((item) => {
        const active = isActivePath(pathname, item.href);
        const Icon = item.icon;

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={
              active
                ? 'flex items-center gap-3 rounded-[14px] px-2 py-3 text-[1rem] font-bold text-brand-ink'
                : 'flex items-center gap-3 rounded-[14px] px-2 py-3 text-[1rem] font-bold text-ink-strong transition hover:text-brand-ink'
            }
          >
            <span
              className={[
                'flex h-9 w-9 items-center justify-center rounded-[8px] border shadow-[0_1px_4px_rgba(0,0,0,0.08)]',
                active
                  ? 'border-line-brand-soft bg-white text-brand-accent'
                  : 'border-line-brand-muted bg-white text-brand-accent',
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
  );
}
