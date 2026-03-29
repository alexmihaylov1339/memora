import { SelectFieldConfig } from '../types';

import styles from './SelectField.module.scss';

interface SelectFieldProps {
  config: SelectFieldConfig;
  disabled?: boolean;
}

export default function SelectField({ config, disabled }: SelectFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={config.name} className={styles.label}>
        {config.label}
        {config.required && <span className={styles.required}> *</span>}
      </label>
      <select
        id={config.name}
        name={config.name}
        defaultValue={config.defaultValue}
        required={config.required}
        disabled={disabled || config.disabled}
        className={styles.select}
      >
        {/* Empty option - label is already translated */}
        <option value="">{config.label}</option>
        {config.options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
