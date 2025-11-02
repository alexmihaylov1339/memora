import { RadioFieldConfig } from '../types';

interface RadioFieldProps {
  config: RadioFieldConfig;
  disabled?: boolean;
}

export default function RadioField({ config, disabled }: RadioFieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <fieldset style={{ border: 'none', padding: 0, margin: 0 }}>
        <legend>
          {config.label}
          {config.required && <span style={{ color: 'red' }}> *</span>}
        </legend>
        {config.options.map((option) => (
          <label
            key={option.value}
            htmlFor={`${config.name}-${option.value}`}
            style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}
          >
            <input
              type="radio"
              id={`${config.name}-${option.value}`}
              name={config.name}
              value={option.value}
              required={config.required}
              disabled={disabled || config.disabled}
            />
            {option.label}
          </label>
        ))}
      </fieldset>
    </div>
  );
}

