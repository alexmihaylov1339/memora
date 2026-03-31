// Base types shared across all fields
export type FieldType = 'text' | 'email' | 'password' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio';

export interface BaseFieldConfig {
  name: string;
  /** Translation key for the field label (will be translated automatically) */
  label: string;
  required?: boolean;
  disabled?: boolean;
  /** Translation key for the field placeholder (will be translated automatically) */
  placeholder?: string;
  /** Initial/default value for uncontrolled input rendering */
  defaultValue?: string | number;
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
  /** Already translated submit button label */
  submitLabel?: string;
  /** Optional className for submit button styling */
  submitButtonClassName?: string;
  /** Optional initial values mapped by field name */
  initialValues?: Partial<Record<string, unknown>>;
  /** Whether labels/placeholders should be translated through next-intl */
  translateFields?: boolean;
  /** Error message from backend (NOT translated - displayed as-is) */
  errorMessage?: string;
  resetOnSubmit?: boolean;
}
