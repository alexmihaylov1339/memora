import type { PasswordFieldConfig } from './types';

interface PasswordFieldProps {
  config: PasswordFieldConfig;
  disabled?: boolean;
}

export default function PasswordField({ config, disabled }: PasswordFieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={config.name}>
        {config.label}
        {config.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <br />
      <input
        type="password"
        id={config.name}
        name={config.name}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
        autoComplete="current-password"
        style={{ padding: 8, width: 300 }}
      />
    </div>
  );
}

