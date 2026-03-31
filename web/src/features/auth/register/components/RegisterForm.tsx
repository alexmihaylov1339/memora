'use client';

import { useState } from 'react';

import { FormBuilder } from '@shared/components';

import { useRegisterFormFields, useRegisterMutation } from '../hooks';

export default function RegisterForm() {
  const fields = useRegisterFormFields();
  const mutation = useRegisterMutation();
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleSubmit = (values: Record<string, string>) => {
    setValidationError(null);

    if (values.password !== values.confirmPassword) {
      setValidationError('Passwords do not match');

      return;
    }

    mutation.mutate({
      email: values.email,
      password: values.password,
      name: values.name || undefined,
    });
  };

  const error =
    validationError ||
    (mutation.isError
      ? mutation.error instanceof Error
        ? mutation.error.message
        : 'Registration failed'
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
        submitLabel={mutation.isPending ? 'Creating account…' : 'Register'}
        submitButtonClassName="rounded-md bg-[var(--primary)] px-4 py-2 text-white disabled:opacity-60"
        translateFields={false}
      />
    </fieldset>
  );
}
