import { CheckboxFieldConfig } from '../types';

interface CheckboxFieldProps {
  config: CheckboxFieldConfig;
  disabled?: boolean;
}

export default function CheckboxField({ config, disabled }: CheckboxFieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={config.name} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          type="checkbox"
          id={config.name}
          name={config.name}
          defaultChecked={config.defaultChecked}
          required={config.required}
          disabled={disabled || config.disabled}
        />
        {config.label}
        {config.required && <span style={{ color: 'red' }}>*</span>}
      </label>
    </div>
  );
}

