import { useState } from 'react';
import type { ReactNode } from 'react';

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import type { SearchResultItem } from '@features/search';

import DeckSelectedItemsGrid from './DeckSelectedItemsGrid';

jest.mock('@/i18n/navigation', () => ({
  Link: ({
    children,
    href,
  }: {
    children: ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

const selectedCards = Array.from({ length: 6 }, (_, index) => {
  const itemNumber = index + 1;

  return {
    id: `card-${itemNumber}`,
    type: 'card',
    label: `Front ${itemNumber}`,
    description: `Back ${itemNumber}`,
  } satisfies SearchResultItem;
});

function renderSelectedItemsGrid(
  items: SearchResultItem[],
  onRemove = jest.fn(),
) {
  render(
    <DeckSelectedItemsGrid
      id="selected-items-grid"
      items={items}
      labelHeader="Front"
      descriptionHeader="Back"
      emptyMessage="No selected items."
      onRemove={onRemove}
      paginate
      pageSize={2}
    />,
  );
}

function ControlledSelectedItemsGrid() {
  const [items, setItems] = useState(selectedCards);

  function handleRemove(itemToRemove: SearchResultItem) {
    setItems((currentItems) =>
      currentItems.filter(
        (item) =>
          !(item.id === itemToRemove.id && item.type === itemToRemove.type),
      ),
    );
  }

  return (
    <DeckSelectedItemsGrid
      id="controlled-selected-items-grid"
      items={items}
      labelHeader="Front"
      descriptionHeader="Back"
      emptyMessage="No selected items."
      onRemove={handleRemove}
      paginate
      pageSize={2}
    />
  );
}

describe('DeckSelectedItemsGrid', () => {
  it('paginates selected items when passed more than the page size', async () => {
    renderSelectedItemsGrid(selectedCards);

    expect(screen.getByText('Front 1')).toBeInTheDocument();
    expect(screen.getByText('Front 2')).toBeInTheDocument();
    expect(screen.queryByText('Front 3')).not.toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));

    expect(screen.getByText('Front 3')).toBeInTheDocument();
    expect(screen.getByText('Front 4')).toBeInTheDocument();
    expect(screen.queryByText('Front 1')).not.toBeInTheDocument();
  });

  it('removes the selected row from the active page', async () => {
    render(<ControlledSelectedItemsGrid />);

    await userEvent.click(screen.getByRole('button', { name: 'Page 2' }));

    const row = screen.getByText('Front 3').closest('tr');
    expect(row).not.toBeNull();

    await userEvent.click(
      within(row as HTMLTableRowElement).getByRole('button', {
        name: 'Remove',
      }),
    );

    expect(screen.queryByText('Front 3')).not.toBeInTheDocument();
    expect(screen.getByText('Front 4')).toBeInTheDocument();
  });
});
