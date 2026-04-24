import type { GridFieldConfig } from './types';

interface GridFieldProps {
  config: GridFieldConfig;
  disabled?: boolean;
}

export default function GridField({ config, disabled }: GridFieldProps) {
  return (
    <div
      className={config.fieldWrapperClassName}
      style={config.fieldWrapperStyle}
    >
      {config.render({
        value: config.value,
        onChange: config.onChange,
        disabled,
      })}
    </div>
  );
}
