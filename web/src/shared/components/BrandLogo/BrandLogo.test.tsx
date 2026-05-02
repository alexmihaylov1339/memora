import { render, screen } from '@testing-library/react';

import BrandLogo from './BrandLogo';

describe('BrandLogo', () => {
  it('renders the Memora mark and word with the shared font class', () => {
    render(<BrandLogo />);

    const mark = screen.getByTestId('brand-logo-mark');
    const word = screen.getByTestId('brand-logo-word');

    expect(mark).toHaveTextContent('m');
    expect(word).toHaveTextContent('memora');
    expect(mark).toHaveClass('className');
    expect(word).toHaveClass('className');
  });

  it('uses sidebar sizing by default', () => {
    render(<BrandLogo />);

    expect(screen.getByTestId('brand-logo-mark')).toHaveClass('h-[52px]');
    expect(screen.getByTestId('brand-logo-word')).toHaveClass('text-[54px]');
  });

  it('supports the auth variant sizing', () => {
    render(<BrandLogo variant="auth" />);

    expect(screen.getByTestId('brand-logo-mark')).toHaveClass('h-[63px]');
    expect(screen.getByTestId('brand-logo-word')).toHaveClass('text-[78px]');
  });
});
