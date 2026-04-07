'use client';

import type { ReactNode } from 'react';

import { useAuth } from '@/shared/components/AuthProvider';

import Navigation from './Navigation';

interface AppShellProps {
  children: ReactNode;
}

export default function AppShell({ children }: AppShellProps) {
  const { isAuthenticated, isReady } = useAuth();

  if (!isReady || !isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-[#ffffff] lg:pl-[285px]">
      <Navigation />
      <div className="min-h-screen">{children}</div>
    </div>
  );
}
