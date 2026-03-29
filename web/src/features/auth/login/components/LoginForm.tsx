'use client';

import { Link } from '@/i18n/navigation';

import { FormBuilder } from '@shared/components';

import { useLoginFormFields, useLoginMutation } from '../hooks';

export default function LoginForm() {
  const fields = useLoginFormFields();
  const mutation = useLoginMutation();

  const handleSubmit = (values: Record<string, string>) => {
    mutation.mutate({
      email: values.email,
      password: values.password,
    });
  };

  const error = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Login failed'
    : null;

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
      <FormBuilder<Record<string, string>>
        fields={fields}
        onSubmit={handleSubmit}
        submitLabel={mutation.isPending ? 'Signing in…' : 'Sign in'}
        submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-60"
        translateFields={false}
      />
      <p className="mt-4 text-sm">
        <Link
          href="/forgot-password"
          className="text-[var(--primary)] hover:underline"
        >
          Forgot password?
        </Link>
      </p>
    </fieldset>
  );
}
