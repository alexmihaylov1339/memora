'use client';

import { useTransition } from 'react';

import { Button } from '../Button';
import { ErrorMessage } from '../ErrorMessage';
import { Field } from './fields';

import type { FormBuilderProps } from './types';

export default function FormBuilder<TFormValues = Record<string, unknown>>({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  errorMessage,
  resetOnSubmit = true,
}: FormBuilderProps<TFormValues>) {
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    // Extract and validate form values based on field configuration
    const values: Record<string, unknown> = {};

    for (const field of fields) {
      const value = formData.get(field.name);

      // Handle different field types
      if (field.type === 'checkbox') {
        values[field.name] = value === 'on' || value === 'true';
      } else if (field.type === 'number') {
        const numValue = value ? Number(value) : undefined;
        values[field.name] = !isNaN(numValue as number) ? numValue : undefined;
      } else {
        // Text, email, password, textarea, select, etc.
        if (value && typeof value === 'string') {
          values[field.name] = value;
        } else if (field.required) {
          throw new Error(`${field.label || field.name} is required`);
        } else {
          values[field.name] = undefined;
        }
      }
    }

    startTransition(async () => {
      await onSubmit(values as TFormValues);
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

