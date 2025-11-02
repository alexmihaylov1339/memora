import { SelectFieldConfig } from '../types';

interface SelectFieldProps {
  config: SelectFieldConfig;
  disabled?: boolean;
}

export default function SelectField({ config, disabled }: SelectFieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={config.name}>
        {config.label}
        {config.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <br />
      <select
        id={config.name}
        name={config.name}
        required={config.required}
        disabled={disabled || config.disabled}
        style={{ padding: 8, width: 316 }}
      >
        <option value="">Select {config.label}</option>
        {config.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

