'use client';

import { GuestOnlyRoute } from '@/shared/components/AuthProvider';

import { ForgotPasswordForm } from '@features/auth/forgot-password/components';

export default function ForgotPasswordPage() {
  return (
    <GuestOnlyRoute>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
          <h1 className="text-2xl font-semibold">Memora</h1>
          <p className="mt-1 text-sm text-gray-600">Forgot password</p>

          <div className="mt-6">
            <ForgotPasswordForm />
          </div>
        </div>
      </div>
    </GuestOnlyRoute>
  );
}
