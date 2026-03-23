import React from 'react';

interface EmailFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const EmailField: React.FC<EmailFieldProps> = ({
  name,
  label,
  value,
  onChange,
  placeholder,
  required,
}) => (
  <div className="mb-4">
    <label htmlFor={name}>{label}</label>
    <input
      id={name}
      name={name}
      type="email"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default EmailField;
