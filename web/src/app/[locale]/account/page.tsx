'use client';

import { ProtectedRoute } from '@/shared/components/AuthProvider';

import { UpdateAccountForm } from '@features/auth/account/components';
import { LanguageSwitcher } from '@shared/components';

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm">
          <div className="mb-4">
            <LanguageSwitcher />
          </div>

          <h1 className="text-2xl font-semibold">Memora</h1>
          <p className="mt-1 text-sm text-gray-600">Update account</p>

          <div className="mt-6">
            <UpdateAccountForm />
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
