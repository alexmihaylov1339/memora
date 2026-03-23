'use client';

import { Suspense } from 'react';

import { Link } from '@/i18n/navigation';
import { useSearchParams } from 'next/navigation';

import { GuestOnlyRoute } from '@/shared/components/AuthProvider';

import { ResetPasswordForm } from '@features/auth/reset-password/components';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  return (
    <div className="mt-6">
      {token ? (
        <ResetPasswordForm token={token} />
      ) : (
        <p className="text-sm text-[var(--secondary)]">
          Invalid or missing reset link. Please{' '}
          <Link
            href="/forgot-password"
            className="text-[var(--primary)] underline"
          >
            request a new one
          </Link>
          .
        </p>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <GuestOnlyRoute>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Memora</h1>
          <p className="mt-1 text-sm text-gray-600">Reset password</p>

          <Suspense fallback={<p className="mt-6 text-sm text-gray-600">Loading…</p>}>
            <ResetPasswordContent />
          </Suspense>
        </div>
      </div>
    </GuestOnlyRoute>
  );
}
