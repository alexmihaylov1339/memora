import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import ReviewGradeButtons from './ReviewGradeButtons';

jest.mock('@shared/components', () => ({
  Button: ({
    children,
    isLoading,
    ...props
  }: ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    isLoading?: boolean;
  }) => (
    <button {...props}>
      {isLoading ? 'Loading...' : children}
    </button>
  ),
  ErrorMessage: ({ message }: { message: string }) => <div>{message}</div>,
}));

describe('ReviewGradeButtons', () => {
  it('allows grading before reveal when not submitting', async () => {
    const user = userEvent.setup();
    const handleGrade = jest.fn();

    render(
      <ReviewGradeButtons
        disabled={false}
        isLoading={false}
        onGrade={handleGrade}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'again' }));

    expect(handleGrade).toHaveBeenCalledWith('again');
    expect(screen.getByText(/Reveal is optional/i)).toBeInTheDocument();
    expect(screen.queryByText(/Reveal the answer, then grade/i)).not.toBeInTheDocument();
  });

  it('disables grading while a grade request is submitting', async () => {
    const user = userEvent.setup();
    const handleGrade = jest.fn();

    render(
      <ReviewGradeButtons
        disabled
        isLoading={false}
        onGrade={handleGrade}
      />,
    );

    const againButton = screen.getByRole('button', { name: 'again' });

    expect(againButton).toBeDisabled();
    await user.click(againButton);
    expect(handleGrade).not.toHaveBeenCalled();
  });
});
