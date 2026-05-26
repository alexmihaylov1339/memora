import { render, screen } from '@testing-library/react';
import type React from 'react';

import KidsPracticeCard from './KidsPracticeCard';

jest.mock('@shared/components', () => ({
  Button: ({
    children,
    className,
    disabled,
    onClick,
    type,
  }: {
    children: React.ReactNode;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
    type?: 'button' | 'submit' | 'reset';
  }) => (
    <button
      className={className}
      disabled={disabled}
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  ),
}));

describe('KidsPracticeCard', () => {
  it('renders a mobile-friendly image/audio card contract', () => {
    const { container } = render(
      <KidsPracticeCard
        cardFields={{
          label: 'Car',
          altText: 'Red toy car',
          imageAsset: {
            path: 'kids-images/user-1/card-1/car.jpg',
            mimeType: 'image/jpeg',
            size: 128,
            url: 'https://cdn.example.com/car.jpg',
          },
          audioAsset: {
            path: 'kids-audio/user-1/card-1/car.mp3',
            mimeType: 'audio/mpeg',
            size: 256,
            url: 'https://cdn.example.com/car.mp3',
          },
        }}
      />,
    );

    expect(screen.getByRole('img', { name: 'Red toy car' })).toHaveAttribute(
      'src',
      'https://cdn.example.com/car.jpg',
    );
    expect(screen.getByRole('button', { name: 'Play Sound' })).toHaveClass(
      'w-full',
      'max-w-sm',
    );

    const audioElement = container.querySelector('audio');
    expect(audioElement).toHaveAttribute('playsinline');
    expect(audioElement).toHaveAttribute('preload', 'metadata');
    expect(audioElement).toHaveAttribute(
      'src',
      'https://cdn.example.com/car.mp3',
    );
  });
});
