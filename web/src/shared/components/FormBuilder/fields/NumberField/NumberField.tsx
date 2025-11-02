import { NumberFieldConfig } from '../types';

interface NumberFieldProps {
  config: NumberFieldConfig;
  disabled?: boolean;
}

export default function NumberField({ config, disabled }: NumberFieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={config.name}>
        {config.label}
        {config.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <br />
      <input
        type="number"
        id={config.name}
        name={config.name}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
        min={config.min}
        max={config.max}
        step={config.step}
        style={{ padding: 8, width: 300 }}
      />
    </div>
  );
}

