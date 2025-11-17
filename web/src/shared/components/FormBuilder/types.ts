// Base types shared across all fields
export type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';

export interface BaseFieldConfig {
  name: string;
  label: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

// Import field types to create union
import type {
  TextFieldConfig,
  EmailFieldConfig,
  PasswordFieldConfig,
  NumberFieldConfig,
  TextareaFieldConfig,
  SelectFieldConfig,
  CheckboxFieldConfig,
  RadioFieldConfig,
} from './fields/types';

// Union of all field configs
export type FieldConfig =
  | TextFieldConfig
  | EmailFieldConfig
  | PasswordFieldConfig
  | NumberFieldConfig
  | TextareaFieldConfig
  | SelectFieldConfig
  | CheckboxFieldConfig
  | RadioFieldConfig;

export interface FormBuilderProps<TFormValues = Record<string, unknown>> {
  fields: FieldConfig[];
  onSubmit: (values: TFormValues) => Promise<unknown> | void;
  submitLabel?: string;
  errorMessage?: string;
  resetOnSubmit?: boolean;
}

