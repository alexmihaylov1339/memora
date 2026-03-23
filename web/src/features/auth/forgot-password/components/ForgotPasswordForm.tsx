'use client';

import { Link } from '@/i18n/navigation';

import AuthFormBuilder from '@/shared/components/auth-form/AuthFormBuilder';

import {
  useForgotPasswordFormFields,
  useForgotPasswordMutation,
} from '../hooks';

export default function ForgotPasswordForm() {
  const fields = useForgotPasswordFormFields();
  const mutation = useForgotPasswordMutation();

  const handleSubmit = (values: Record<string, string>) => {
    mutation.mutate(values.email);
  };

  const error = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Something went wrong'
    : null;

  const success = mutation.isSuccess ? mutation.data : null;

  return (
    <fieldset
      disabled={mutation.isPending}
      className="border-none p-0 m-0 min-w-0"
    >
      {error && (
        <p className="mb-4 text-sm text-[var(--destructive)]" role="alert">
          {error}
        </p>
      )}
      {success && (
        <div className="mb-4 space-y-2">
          <p className="text-sm text-[var(--success)]">{success.message}</p>
          {success.resetToken && (
            <p className="text-xs text-[var(--secondary)] break-all">
              Dev reset link:{' '}
              <Link
                href={`/reset-password?token=${success.resetToken}`}
                className="text-[var(--primary)] underline"
              >
                Reset password
              </Link>
            </p>
          )}
        </div>
      )}
      {!success && (
        <AuthFormBuilder
          fields={fields}
          onSubmit={handleSubmit}
          submitLabel={mutation.isPending ? 'Sending…' : 'Send reset link'}
        />
      )}
      <p className="mt-4 text-sm">
        <Link href="/login" className="text-[var(--primary)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </fieldset>
  );
}
