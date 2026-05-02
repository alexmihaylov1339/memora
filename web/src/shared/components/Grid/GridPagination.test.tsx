import { render, screen } from '@testing-library/react';

import GridPagination from './GridPagination';

describe('GridPagination', () => {
  it('uses pointer cursor for enabled pagination buttons', () => {
    render(
      <GridPagination
        currentPage={2}
        totalPages={3}
        pages={[1, 2, 3]}
        onPrev={jest.fn()}
        onPage={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveClass(
      'cursor-pointer',
    );
    expect(screen.getByRole('button', { name: 'Page 1' })).toHaveClass(
      'cursor-pointer',
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveClass(
      'cursor-pointer',
    );
  });

  it('keeps disabled cursor affordance for unavailable pagination buttons', () => {
    render(
      <GridPagination
        currentPage={1}
        totalPages={1}
        pages={[1]}
        onPrev={jest.fn()}
        onPage={jest.fn()}
        onNext={jest.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveClass(
      'disabled:cursor-not-allowed',
    );
    expect(screen.getByRole('button', { name: 'Next page' })).toHaveClass(
      'disabled:cursor-not-allowed',
    );
  });
});
