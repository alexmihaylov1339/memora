'use client';

import { Button } from '../Button';
import { Modal } from '../Modal';

export interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  cancelLabel?: string;
  confirmLabel?: string;
  isConfirming?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function ConfirmationModal({
  isOpen,
  title,
  message,
  cancelLabel = 'Cancel',
  confirmLabel = 'Confirm',
  isConfirming = false,
  onCancel,
  onConfirm,
}: ConfirmationModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      footer={
        <>
          <Button
            onClick={onCancel}
            disabled={isConfirming}
            className="rounded-[5px] border border-line px-4 py-2 text-sm text-ink-muted transition hover:bg-surface-soft disabled:opacity-50"
          >
            {cancelLabel}
          </Button>
          <Button
            onClick={onConfirm}
            isLoading={isConfirming}
            className="rounded-[5px] bg-destructive-text px-4 py-2 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      <p className="text-sm leading-6 text-ink-muted">{message}</p>
    </Modal>
  );
}
