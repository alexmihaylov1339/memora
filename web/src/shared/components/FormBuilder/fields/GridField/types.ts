import type { ReactNode } from 'react';
import type { BaseFieldConfig } from '../../types';

export interface GridFieldRenderProps {
  value: unknown;
  onChange: (value: unknown) => void;
  disabled?: boolean;
}

export interface GridFieldConfig extends BaseFieldConfig {
  type: 'grid';
  value: unknown;
  onChange: (value: unknown) => void;
  render: (props: GridFieldRenderProps) => ReactNode;
  serialize?: (value: unknown) => unknown;
}
