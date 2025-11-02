import type { EmailFieldConfig } from './types';

interface EmailFieldProps {
  config: EmailFieldConfig;
  disabled?: boolean;
}

export default function EmailField({ config, disabled }: EmailFieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={config.name}>
        {config.label}
        {config.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <br />
      <input
        type="email"
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

