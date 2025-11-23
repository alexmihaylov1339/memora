import { TextareaFieldConfig } from '../types';

import styles from './TextareaField.module.scss';

interface TextareaFieldProps {
  config: TextareaFieldConfig;
  disabled?: boolean;
}

export default function TextareaField({ config, disabled }: TextareaFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={config.name} className={styles.label}>
        {config.label}
        {config.required && <span className={styles.required}> *</span>}
      </label>
      <textarea
        id={config.name}
        name={config.name}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
        rows={config.rows || 4}
        cols={config.cols}
        className={styles.textarea}
      />
    </div>
  );
}

