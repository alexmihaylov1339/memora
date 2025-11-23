import type { EmailFieldConfig } from './types';

import styles from './EmailField.module.scss';

interface EmailFieldProps {
  config: EmailFieldConfig;
  disabled?: boolean;
}

export default function EmailField({ config, disabled }: EmailFieldProps) {
  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={config.name} className={styles.label}>
        {config.label}
        {config.required && <span className={styles.required}> *</span>}
      </label>
      <input
        type="email"
        id={config.name}
        name={config.name}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
        className={styles.input}
      />
    </div>
  );
}

