'use client';

import { Link } from '@/i18n/navigation';

import { APP_ROUTES } from '@/shared/constants';

import { BrandLogo } from '../BrandLogo';
import NavigationLinks from './NavigationLinks';

export default function DesktopNavigation() {
  return (
    <nav className="fixed inset-y-0 left-0 z-20 hidden w-[285px] border-r border-line-nav bg-surface-nav px-12 py-10 lg:flex lg:flex-col">
      <Link href={APP_ROUTES.home} className="mb-16 self-start">
        <BrandLogo />
      </Link>

      <NavigationLinks />
    </nav>
  );
}
