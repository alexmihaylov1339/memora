import React, { useMemo } from 'react';

import FormBuilder from '../FormBuilder/FormBuilder';
import type { FieldConfig } from '../FormBuilder/types';

export type AuthFormField = {
  name: string;
  label: string;
  type: 'text' | 'password' | 'email' | 'number';
  placeholder?: string;
  required?: boolean;
};

export type AuthFormBuilderProps = {
  fields: AuthFormField[];
  onSubmit: (values: Record<string, string>) => void;
  submitLabel?: string;
  initialValues?: Record<string, string>;
};

const AuthFormBuilder: React.FC<AuthFormBuilderProps> = ({
  fields,
  onSubmit,
  submitLabel = 'Submit',
  initialValues,
}) => {
  const formFields = useMemo<FieldConfig[]>(
    () =>
      fields.map((field) => ({
        type: field.type,
        name: field.name,
        label: field.label,
        placeholder: field.placeholder,
        required: field.required,
      })),
    [fields],
  );

  const normalizedInitialValues = useMemo(
    () =>
      fields.reduce(
        (acc, field) => {
          acc[field.name] = initialValues?.[field.name] ?? '';
          return acc;
        },
        {} as Record<string, string>,
      ),
    [fields, initialValues],
  );

  const handleSubmit = (values: Record<string, unknown>) => {
    const normalizedValues = fields.reduce(
      (acc, field) => {
        const value = values[field.name];
        acc[field.name] = typeof value === 'string' ? value : '';
        return acc;
      },
      {} as Record<string, string>,
    );

    onSubmit(normalizedValues);
  };

  return (
    <FormBuilder<Record<string, unknown>>
      fields={formFields}
      onSubmit={handleSubmit}
      submitLabel={submitLabel}
      initialValues={normalizedInitialValues}
      translateFields={false}
      resetOnSubmit={false}
    />
  );
};

export default AuthFormBuilder;
