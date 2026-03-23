'use client';

import { useMemo } from 'react';

import AuthFormBuilder, {
  type AuthFormField,
} from '@/shared/components/auth-form/AuthFormBuilder';

import { useGetCurrentUser, useUpdateAccountMutation } from '../hooks';

const ACCOUNT_FORM_FIELDS: AuthFormField[] = [
  {
    name: 'name',
    label: 'Display name',
    type: 'text',
    placeholder: 'Your name',
  },
  {
    name: 'email',
    label: 'Email',
    type: 'email',
    placeholder: 'you@example.com',
    required: true,
  },
];

export default function UpdateAccountForm() {
  const fields = useMemo(() => ACCOUNT_FORM_FIELDS, []);
  const { data: user, isLoading, isError, error } = useGetCurrentUser();
  const mutation = useUpdateAccountMutation();

  const initialValues = useMemo(
    () =>
      user
        ? {
            name: user.name ?? '',
            email: user.email ?? '',
          }
        : undefined,
    [user],
  );

  const handleSubmit = (values: Record<string, string>) => {
    mutation.mutate({
      name: values.name || undefined,
      email: values.email?.trim() || undefined,
    });
  };

  if (isLoading) {
    return <p className="text-sm text-gray-600">Loading…</p>;
  }

  if (isError) {
    return (
      <p className="text-sm text-[var(--destructive)]" role="alert">
        {error instanceof Error ? error.message : 'Failed to load account'}
      </p>
    );
  }

  const submitError = mutation.isError
    ? mutation.error instanceof Error
      ? mutation.error.message
      : 'Update failed'
    : null;

  return (
    <fieldset
      disabled={mutation.isPending}
      className="border-none p-0 m-0 min-w-0"
    >
      {submitError && (
        <p className="mb-4 text-sm text-[var(--destructive)]" role="alert">
          {submitError}
        </p>
      )}
      <AuthFormBuilder
        fields={fields}
        initialValues={initialValues}
        onSubmit={handleSubmit}
        submitLabel={mutation.isPending ? 'Updating…' : 'Update account'}
      />
    </fieldset>
  );
}
