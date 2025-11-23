import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FormBuilder from './FormBuilder';
import type { FieldConfig } from './types';

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => (key: string) => {
    const translations: Record<string, string> = {
      'form.username': 'Username',
      'form.email': 'Email',
      'form.password': 'Password',
      'form.age': 'Age',
      'form.bio': 'Biography',
      'form.country': 'Country',
      'form.terms': 'I agree to terms',
      'form.gender': 'Gender',
      'form.placeholder.username': 'Enter your username',
      'form.placeholder.email': 'Enter your email',
    };
    return translations[key] || key;
  },
}));

describe('FormBuilder', () => {
  describe('Basic Rendering', () => {
    it('renders a form with text fields', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('renders multiple fields', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
        { type: 'email', name: 'email', label: 'form.email' },
        { type: 'password', name: 'password', label: 'form.password' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.getByLabelText('Email')).toBeInTheDocument();
      expect(screen.getByLabelText('Password')).toBeInTheDocument();
    });

    it('renders custom submit label', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} submitLabel="Save Changes" />);

      expect(screen.getByRole('button', { name: 'Save Changes' })).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls onSubmit with form values when submitted', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
        { type: 'email', name: 'email', label: 'form.email' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'john_doe' } });
      fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'john@example.com' } });

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({
          username: 'john_doe',
          email: 'john@example.com',
        });
      });
    });

    it('handles checkbox values correctly', async () => {
      const fields: FieldConfig[] = [
        { type: 'checkbox', name: 'terms', label: 'form.terms' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      const checkbox = screen.getByLabelText('I agree to terms');
      fireEvent.click(checkbox);
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ terms: true });
      });
    });

    it('handles number values correctly', async () => {
      const fields: FieldConfig[] = [
        { type: 'number', name: 'age', label: 'form.age' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText('Age'), { target: { value: '25' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ age: 25 });
      });
    });

    it('resets form after submission when resetOnSubmit is true', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} resetOnSubmit={true} />);

      const input = screen.getByLabelText('Username') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'john_doe' } });
      expect(input.value).toBe('john_doe');

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(input.value).toBe('');
      });
    });

    it('does not reset form after submission when resetOnSubmit is false', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} resetOnSubmit={false} />);

      const input = screen.getByLabelText('Username') as HTMLInputElement;
      fireEvent.change(input, { target: { value: 'john_doe' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalled();
      });

      expect(input.value).toBe('john_doe');
    });
  });

  describe('Error Handling', () => {
    it('displays error message when provided', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
      ];
      const onSubmit = jest.fn();

      render(
        <FormBuilder
          fields={fields}
          onSubmit={onSubmit}
          errorMessage="Invalid credentials"
        />
      );

      expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
    });

    it('does not display error message when not provided', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.queryByText(/error/i)).not.toBeInTheDocument();
    });
  });

  describe('Loading State', () => {
    it('disables all fields during submission', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
        { type: 'email', name: 'email', label: 'form.email' },
      ];
      let resolveSubmit: () => void;
      const onSubmit = jest.fn(() => new Promise<void>(resolve => {
        resolveSubmit = resolve;
      }));

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      const usernameInput = screen.getByLabelText('Username');
      const emailInput = screen.getByLabelText('Email');

      fireEvent.change(usernameInput, { target: { value: 'john' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(usernameInput).toBeDisabled();
        expect(emailInput).toBeDisabled();
      });

      resolveSubmit!();
    });

    it('shows loading state on submit button', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
      ];
      let resolveSubmit: () => void;
      const onSubmit = jest.fn(() => new Promise<void>(resolve => {
        resolveSubmit = resolve;
      }));

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      fireEvent.change(screen.getByLabelText('Username'), { target: { value: 'john' } });
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(screen.getByText('Loading...')).toBeInTheDocument();
      });

      resolveSubmit!();
    });
  });

  describe('Field Types', () => {
    it('renders all field types correctly', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
        { type: 'email', name: 'email', label: 'form.email' },
        { type: 'password', name: 'password', label: 'form.password' },
        { type: 'number', name: 'age', label: 'form.age' },
        { type: 'textarea', name: 'bio', label: 'form.bio' },
        { type: 'select', name: 'country', label: 'form.country', options: [
          { value: 'us', label: 'United States' },
          { value: 'uk', label: 'United Kingdom' },
        ]},
        { type: 'checkbox', name: 'terms', label: 'form.terms' },
        { type: 'radio', name: 'gender', label: 'form.gender', options: [
          { value: 'male', label: 'Male' },
          { value: 'female', label: 'Female' },
        ]},
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByLabelText('Username')).toHaveAttribute('type', 'text');
      expect(screen.getByLabelText('Email')).toHaveAttribute('type', 'email');
      expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
      expect(screen.getByLabelText('Age')).toHaveAttribute('type', 'number');
      expect(screen.getByLabelText('Biography')).toBeInTheDocument();
      expect(screen.getByRole('combobox')).toBeInTheDocument();
      expect(screen.getByLabelText('I agree to terms')).toHaveAttribute('type', 'checkbox');
      expect(screen.getByLabelText('Male')).toHaveAttribute('type', 'radio');
    });
  });

  describe('Required Fields', () => {
    it('marks required fields with asterisk', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username', required: true },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByText('*')).toBeInTheDocument();
    });

    it('applies required attribute to required fields', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username', required: true },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByLabelText(/Username/)).toBeRequired();
    });
  });

  describe('Translation', () => {
    it('translates field labels', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByLabelText('Username')).toBeInTheDocument();
      expect(screen.queryByText('form.username')).not.toBeInTheDocument();
    });

    it('translates field placeholders', () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username', placeholder: 'form.placeholder.username' },
      ];
      const onSubmit = jest.fn();

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      expect(screen.getByPlaceholderText('Enter your username')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty fields array', () => {
      const onSubmit = jest.fn();

      render(<FormBuilder fields={[]} onSubmit={onSubmit} />);

      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
    });

    it('handles undefined values in form submission', async () => {
      const fields: FieldConfig[] = [
        { type: 'text', name: 'username', label: 'form.username', required: false },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ username: undefined });
      });
    });

    it('handles number field with non-numeric input', async () => {
      const fields: FieldConfig[] = [
        { type: 'number', name: 'age', label: 'form.age' },
      ];
      const onSubmit = jest.fn().mockResolvedValue(undefined);

      render(<FormBuilder fields={fields} onSubmit={onSubmit} />);

      // Browser input type="number" prevents non-numeric input, so test empty submission
      fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

      await waitFor(() => {
        expect(onSubmit).toHaveBeenCalledWith({ age: undefined });
      });
    });
  });
});

