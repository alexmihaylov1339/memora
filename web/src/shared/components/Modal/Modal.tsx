'use client';

import type { ReactNode } from 'react';

export interface ModalProps {
  isOpen: boolean;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidthClassName?: string;
  onClose: () => void;
}

export default function Modal({
  isOpen,
  title,
  children,
  footer,
  maxWidthClassName = 'max-w-md',
  onClose,
}: ModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        className={`w-full ${maxWidthClassName} rounded-lg bg-white shadow-xl`}
        onClick={(event) => event.stopPropagation()}
      >
        {title && (
          <div className="px-6 pt-6">
            <h2
              id="modal-title"
              className="text-lg font-semibold text-ink-heading"
            >
              {title}
            </h2>
          </div>
        )}

        <div className="px-6 py-4">{children}</div>

        {footer && (
          <div className="flex justify-end gap-3 border-t border-line px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
