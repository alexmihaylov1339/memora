import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ButtonHTMLAttributes, ReactNode } from 'react';

import ReviewRetryGradeBanner from './ReviewRetryGradeBanner';

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
}));

describe('ReviewRetryGradeBanner', () => {
  it('shows the failed grade and calls retry', async () => {
    const user = userEvent.setup();
    const handleRetry = jest.fn();

    render(
      <ReviewRetryGradeBanner
        cardId="card-1"
        errorMessage="Network failed"
        grade="hard"
        isRetrying={false}
        onRetry={handleRetry}
      />,
    );

    expect(screen.getByText('Previous grade did not save.')).toBeInTheDocument();
    expect(screen.getByText(/Retry hard for card card-1/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Retry' }));
    expect(handleRetry).toHaveBeenCalledTimes(1);
  });

  it('disables retry while retrying', () => {
    render(
      <ReviewRetryGradeBanner
        cardId="card-1"
        errorMessage="Network failed"
        grade="good"
        isRetrying
        onRetry={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Loading...' })).toBeDisabled();
  });
});
