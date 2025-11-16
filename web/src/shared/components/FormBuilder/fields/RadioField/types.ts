import type { BaseFieldConfig } from '../../types';

export interface RadioFieldConfig extends Omit<BaseFieldConfig, 'placeholder'> {
  type: 'radio';
  options: Array<{ value: string; label: string }>;
}


