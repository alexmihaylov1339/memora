import React from 'react';

interface NumberFieldProps {
  name: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  required?: boolean;
}

const NumberField: React.FC<NumberFieldProps> = ({
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
      type="number"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
      className="block w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
    />
  </div>
);

export default NumberField;
