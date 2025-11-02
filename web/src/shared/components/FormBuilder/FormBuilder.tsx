'use client';

import { useTransition } from 'react';

import { Button } from '../Button';
import { ErrorMessage } from '../ErrorMessage';
import { Field } from './fields';

import type { FormBuilderProps } from './types';

export default function FormBuilder({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  errorMessage,
  resetOnSubmit = true,
}: FormBuilderProps) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    startTransition(async () => {
      await onSubmit(formData);
      if (resetOnSubmit) {
        form.reset();
      }
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => (
        <Field key={field.name} config={field} disabled={isPending} />
      ))}

      {errorMessage && <ErrorMessage message={errorMessage} />}

      <Button type="submit" isLoading={isPending}>
        {submitLabel}
      </Button>
    </form>
  );
}

