import { TextareaFieldConfig } from '../types';

interface TextareaFieldProps {
  config: TextareaFieldConfig;
  disabled?: boolean;
}

export default function TextareaField({ config, disabled }: TextareaFieldProps) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label htmlFor={config.name}>
        {config.label}
        {config.required && <span style={{ color: 'red' }}> *</span>}
      </label>
      <br />
      <textarea
        id={config.name}
        name={config.name}
        placeholder={config.placeholder}
        required={config.required}
        disabled={disabled || config.disabled}
        rows={config.rows || 4}
        cols={config.cols}
        style={{ padding: 8, width: 300 }}
      />
    </div>
  );
}

