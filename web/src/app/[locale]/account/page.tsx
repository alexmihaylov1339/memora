'use client';

import {
  LanguageSwitcher,
  ProtectedRoute,
} from '@shared/components';

import {
  LogoutButton,
  UpdateAccountForm,
} from '@features/auth/account/components';

export default function AccountPage() {
  return (
    <ProtectedRoute>
      <main className="p-6">
        <div className="mb-6 flex items-center justify-between gap-3">
          <h1 className="text-xl font-semibold text-ink-strong">Account</h1>
          <LanguageSwitcher />
        </div>

        <div className="max-w-md">
          <UpdateAccountForm />
          <LogoutButton />
        </div>
      </main>
    </ProtectedRoute>
  );
}
