import type { TextFieldConfig } from './types';

import styles from './TextField.module.scss';

interface TextFieldProps {
  config: TextFieldConfig;
  disabled?: boolean;
}

export default function TextField({ config, disabled }: TextFieldProps) {
  return (
    <div className={styles.fieldWrapper}>
      <label htmlFor={config.name} className={styles.label}>
        {config.label}
        {config.required && <span className={styles.required}> *</span>}
      </label>
      <input
        type="text"
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

