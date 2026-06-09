'use client';

import { GuestOnlyRoute } from '@features/auth';
import { AuthShell } from '@features/auth/components';
import { RegisterForm } from '@features/auth/register/components';

export default function RegisterPage() {
  return (
    <GuestOnlyRoute>
      <AuthShell>
        <RegisterForm />
      </AuthShell>
    </GuestOnlyRoute>
  );
}
