'use client';

import { GuestOnlyRoute } from '@features/auth';
import { AuthShell } from '@features/auth/components';
import { LoginForm } from '@features/auth/login/components';

export default function LoginPage() {
  return (
    <GuestOnlyRoute>
      <AuthShell>
        <LoginForm />
      </AuthShell>
    </GuestOnlyRoute>
  );
}
