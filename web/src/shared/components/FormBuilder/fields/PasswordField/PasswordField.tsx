import type { PasswordFieldConfig } from './types';

import styles from './PasswordField.module.scss';

interface PasswordFieldProps {
  config: PasswordFieldConfig;
  disabled?: boolean;
}

export default function PasswordField({ config, disabled }: PasswordFieldProps) {
  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={config.name} className={styles.label}>
        {config.label}
        {config.required && <span className={styles.required}> *</span>}
      </label>
      <input
        type="password"
        id={config.name}
        name={config.name}
        defaultValue={config.defaultValue}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
        autoComplete="current-password"
        className={styles.input}
      />
    </div>
  );
}
