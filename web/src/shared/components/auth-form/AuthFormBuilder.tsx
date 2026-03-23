import React, { useEffect, useState } from 'react';

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
  const [values, setValues] = useState<Record<string, string>>(
    fields.reduce(
      (acc, field) => {
        acc[field.name] = initialValues?.[field.name] ?? '';
        return acc;
      },
      {} as Record<string, string>,
    ),
  );

  useEffect(() => {
    if (!initialValues) return;
    setValues((prev) =>
      fields.reduce(
        (acc, field) => {
          acc[field.name] = initialValues[field.name] ?? prev[field.name] ?? '';
          return acc;
        },
        {} as Record<string, string>,
      ),
    );
  }, [initialValues, fields]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(values);
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
            value={values[field.name]}
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
