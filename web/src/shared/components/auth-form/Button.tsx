import React from 'react';

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary';
};

const baseStyles =
  'cursor-pointer px-4 py-2 rounded font-semibold transition-colors disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500';

const variants: Record<string, string> = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700',
  secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
};

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  className = '',
  ...props
}) => {
  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
