'use client';

import { useState } from 'react';

import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@/shared/constants';

import { BrandLogo } from '../BrandLogo';
import NavigationLinks from './NavigationLinks';

export default function MobileNavigation() {
  const [isOpen, setIsOpen] = useState(false);
  const closeNavigation = () => setIsOpen(false);
  const toggleNavigation = () => setIsOpen((current) => !current);

  return (
    <>
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-line bg-white px-4 py-3 lg:hidden">
        <Link href={APP_ROUTES.home} aria-label="Memora home">
          <BrandLogo />
        </Link>

        <button
          type="button"
          aria-controls="mobile-navigation-menu"
          aria-expanded={isOpen}
          aria-label={isOpen ? 'Close navigation menu' : 'Open navigation menu'}
          onClick={toggleNavigation}
          className="inline-flex h-10 w-10 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-md border border-line bg-white text-brand-ink shadow-sm transition hover:bg-brand-soft"
        >
          <span className="h-0.5 w-5 rounded-full bg-current" />
          <span className="h-0.5 w-5 rounded-full bg-current" />
          <span className="h-0.5 w-5 rounded-full bg-current" />
        </button>
      </header>

      {isOpen && (
        <button
          type="button"
          aria-label="Close navigation backdrop"
          className="fixed inset-0 z-40 cursor-pointer bg-black/30 lg:hidden"
          onClick={closeNavigation}
        />
      )}

      {isOpen && (
        <aside
          id="mobile-navigation-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Navigation menu"
          className="fixed inset-y-0 left-0 z-50 w-[285px] border-r border-line-nav bg-white px-8 py-8 shadow-xl lg:hidden"
        >
          <div className="mb-10 flex items-center justify-between gap-3">
            <Link href={APP_ROUTES.home} onClick={closeNavigation}>
              <BrandLogo />
            </Link>

            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeNavigation}
              className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border border-line bg-white text-xl leading-none text-brand-ink"
            >
              X
            </button>
          </div>

          <NavigationLinks onNavigate={closeNavigation} />
        </aside>
      )}
    </>
  );
}
