import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';

import Grid, { type GridColumnDef } from './Grid';

interface TestRow {
  id: string;
  name: string;
}

const columnDefs: GridColumnDef<TestRow>[] = [
  { field: 'name', headerName: 'Name' },
];

describe('Grid delete confirmation', () => {
  it('confirms before running the delete action', async () => {
    const onDelete = jest.fn().mockResolvedValue(undefined);

    render(
      <Grid
        id="test-grid"
        rowData={[{ id: 'row-1', name: 'First row' }]}
        columnDefs={columnDefs}
        onDelete={onDelete}
        deleteConfirmationTitle="Delete row?"
        getDeleteConfirmationMessage={(row) => `Delete ${row.name}?`}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(onDelete).not.toHaveBeenCalled();

    const dialog = screen.getByRole('dialog', { name: 'Delete row?' });
    expect(dialog).toHaveTextContent('Delete First row?');

    fireEvent.click(within(dialog).getByRole('button', { name: 'Delete' }));

    await waitFor(() => {
      expect(onDelete).toHaveBeenCalledWith({ id: 'row-1', name: 'First row' });
    });
  });
});
