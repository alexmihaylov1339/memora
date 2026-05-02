'use client';

import DesktopNavigation from './DesktopNavigation';
import MobileNavigation from './MobileNavigation';

export default function Navigation() {
  return (
    <>
      <MobileNavigation />
      <DesktopNavigation />
    </>
  );
}
