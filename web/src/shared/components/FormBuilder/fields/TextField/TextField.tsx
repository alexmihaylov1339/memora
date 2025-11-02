import type { TextFieldConfig } from './types';

interface TextFieldProps {
  config: TextFieldConfig;
  disabled?: boolean;
}

export default function TextField({ config, disabled }: TextFieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={config.name}>
        {config.label}
        {config.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <br />
      <input
        type="text"
        id={config.name}
        name={config.name}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
        style={{ padding: 8, width: 300 }}
      />
    </div>
  );
}

