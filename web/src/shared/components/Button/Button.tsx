'use client';

import type { ButtonProps } from './types';

export default function Button({
  children,
  isLoading = false,
  disabled,
  type = 'button',
  className = '',
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={className}
      {...rest}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
}

