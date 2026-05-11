import { useState } from 'react';

interface UseGridDeleteConfirmationParams<TRow> {
  onDelete?: (row: TRow) => Promise<void> | void;
}

export default function useGridDeleteConfirmation<TRow>({
  onDelete,
}: UseGridDeleteConfirmationParams<TRow>) {
  const [rowPendingDelete, setRowPendingDelete] = useState<TRow | null>(null);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);

  async function confirmDelete() {
    if (!rowPendingDelete || !onDelete) {
      return;
    }

    setIsDeleteConfirming(true);
    try {
      await onDelete(rowPendingDelete);
      setRowPendingDelete(null);
    } finally {
      setIsDeleteConfirming(false);
    }
  }

  return {
    cancelDelete: () => setRowPendingDelete(null),
    confirmDelete,
    isDeleteConfirming,
    requestDelete: setRowPendingDelete,
    rowPendingDelete,
  };
}
