'use client';

import { Suspense } from 'react';

import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

import { GuestOnlyRoute } from '@/shared/components/AuthProvider';
import { APP_ROUTES } from '@/shared/constants';

import { AuthShell } from '@features/auth/components';
import { ResetPasswordForm } from '@features/auth/reset-password/components';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  if (!token) {
    return (
      <p className="text-[18px] font-bold tracking-[0.01em] text-[rgba(1,1,1,0.55)]">
        Invalid or missing reset link. Please{' '}
        <Link href={APP_ROUTES.forgotPassword} className="text-[#1d6fa5] hover:underline">
          request a new one
        </Link>
        .
      </p>
    );
  }

  return <ResetPasswordForm token={token} />;
}

export default function ResetPasswordPage() {
  return (
    <GuestOnlyRoute>
      <AuthShell description="Enter your new password to get back in.">
        <Suspense fallback={<p className="text-sm text-[rgba(1,1,1,0.4)]">Loading…</p>}>
          <ResetPasswordContent />
        </Suspense>
      </AuthShell>
    </GuestOnlyRoute>
  );
}
