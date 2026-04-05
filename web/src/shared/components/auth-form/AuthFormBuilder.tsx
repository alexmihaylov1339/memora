import React, { useMemo, useState } from 'react';

import Button from './Button';
import Fields from './formfields/Fields';

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
  const initialFieldValues = useMemo(
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

  const [values, setValues] = useState<Record<string, string>>(
    initialFieldValues,
  );

  const fieldValues = useMemo(
    () =>
      fields.reduce(
        (acc, field) => {
          acc[field.name] = values[field.name] ?? initialFieldValues[field.name] ?? '';
          return acc;
        },
        {} as Record<string, string>,
      ),
    [fields, initialFieldValues, values],
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues((currentValues) => ({
      ...currentValues,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(fieldValues);
  };

  return (
    <form onSubmit={handleSubmit}>
      {fields.map((field) => {
        const FieldComponent = Fields[field.type];

        if (!FieldComponent) return null;

        return (
          <FieldComponent
            key={field.name}
            name={field.name}
            label={field.label}
            value={fieldValues[field.name]}
            onChange={handleChange}
            placeholder={field.placeholder}
            required={field.required}
          />
        );
      })}
      <Button type="submit">{submitLabel}</Button>
    </form>
  );
};

export default AuthFormBuilder;
