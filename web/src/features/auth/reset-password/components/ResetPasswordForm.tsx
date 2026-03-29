'use client';

import { useState } from 'react';

import { Link } from '@/i18n/navigation';

import { FormBuilder } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';

import {
  useResetPasswordFormFields,
  useResetPasswordMutation,
} from '../hooks';

type ResetPasswordFormProps = {
  token: string;
};

export default function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const fields = useResetPasswordFormFields();
  const mutation = useResetPasswordMutation(token);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (values: Record<string, string>) => {
    setValidationError(null);

    if (values.password !== values.confirmPassword) {
      setValidationError('Passwords do not match');
      return;
    }

    mutation.mutate(values.password);
  };

  const error =
    validationError ||
    (mutation.isError
      ? mutation.error instanceof Error
        ? mutation.error.message
        : 'Failed to reset password'
      : null);

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
        submitLabel={mutation.isPending ? 'Resetting…' : 'Reset password'}
        submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-60"
        translateFields={false}
      />
      <p className="mt-4 text-sm">
        <Link href={APP_ROUTES.login} className="text-[var(--primary)] hover:underline">
          Back to sign in
        </Link>
      </p>
    </fieldset>
  );
}
