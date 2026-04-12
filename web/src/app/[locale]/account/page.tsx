'use client';

import { ProtectedRoute } from '@/shared/components/AuthProvider';

import { UpdateAccountForm } from '@features/auth/account/components';
import { LanguageSwitcher } from '@shared/components';

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-[rgba(1,1,1,0.72)]">Account</h1>
          <LanguageSwitcher />
        </div>

        <div className="max-w-md">
          <UpdateAccountForm />
        </div>
      </main>
    </ProtectedRoute>
  );
}
