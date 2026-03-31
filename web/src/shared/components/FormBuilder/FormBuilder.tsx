'use client';

import { useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { Button } from '../Button';
import { ErrorMessage } from '../ErrorMessage';
import { Field } from './fields';
import { isNumber, isString, isUndefined } from '@shared/utils';

import type { FormBuilderProps } from './types';

export default function FormBuilder<TFormValues = Record<string, unknown>>({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  submitButtonClassName,
  initialValues,
  translateFields = true,
  errorMessage,
  resetOnSubmit = true,
}: FormBuilderProps<TFormValues>) {
  const [isPending, startTransition] = useTransition();
  const t = useTranslations();

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
        if (value && isString(value)) {
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
      {fields.map((field) => {
        const initialValue = initialValues?.[field.name];
        const translatedField = {
          ...field,
          label: translateFields && field.label ? t(field.label) : field.label,
          ...('placeholder' in field && field.placeholder
            ? { placeholder: translateFields ? t(field.placeholder) : field.placeholder }
            : {}),
          ...(field.type === 'checkbox'
            ? { defaultChecked: Boolean(initialValue) }
            : {}),
          ...(field.type !== 'checkbox' && !isUndefined(initialValue)
            ? {
                defaultValue:
                  isString(initialValue) || isNumber(initialValue)
                    ? initialValue
                    : '',
              }
            : {}),
        };
        return <Field key={field.name} config={translatedField} disabled={isPending} />;
      })}

      {/* errorMessage comes from BE - do NOT translate */}
      {errorMessage && <ErrorMessage message={errorMessage} />}

      <Button type="submit" isLoading={isPending} className={submitButtonClassName}>
        {submitLabel}
      </Button>
    </form>
  );
}
