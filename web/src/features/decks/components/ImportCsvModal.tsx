'use client';

import { useState } from 'react';

import { Button, ErrorMessage } from '@shared/components';

import type { ImportCardsResponse } from '../types';
import { parseCsvText } from '../utils';
import { useImportCardsMutation } from '../hooks';
import { CsvFileSelector } from './CsvFileSelector';
import { CsvPreviewTable } from './CsvPreviewTable';
import type { ParsedRow, SkippedRow } from '../utils';

type ModalState =
  | { kind: 'idle' }
  | { kind: 'parsing' }
  | { kind: 'preview'; file: File; rows: ParsedRow[]; skipped: SkippedRow[] }
  | { kind: 'importing' }
  | { kind: 'error'; message: string };

export interface ImportCsvModalProps {
  isOpen: boolean;
  onClose: () => void;
  deckId?: string;
  onImportComplete?: (result: ImportCardsResponse) => void;
  deferred?: boolean;
  onDeferredConfirm?: (file: File, rowCount: number) => void;
}

export function ImportCsvModal({
  isOpen,
  onClose,
  deckId,
  onImportComplete,
  deferred = false,
  onDeferredConfirm,
}: ImportCsvModalProps) {
  const [state, setState] = useState<ModalState>({ kind: 'idle' });
  const importMutation = useImportCardsMutation();

  function handleClose() {
    setState({ kind: 'idle' });
    onClose();
  }

  async function handleFileSelect(file: File) {
    setState({ kind: 'parsing' });
    try {
      const text = await file.text();
      const { rows, skipped } = parseCsvText(text);
      setState({ kind: 'preview', file, rows, skipped });
    } catch {
      setState({ kind: 'error', message: 'Could not read the selected file.' });
    }
  }

  async function handleConfirmImport() {
    if (state.kind !== 'preview') return;

    if (deferred) {
      onDeferredConfirm?.(state.file, state.rows.length);
      handleClose();
      return;
    }

    setState({ kind: 'importing' });
    try {
      const result = await importMutation.fetch({ file: state.file, deckId });
      onImportComplete?.(result);
      handleClose();
    } catch (error) {
      setState({
        kind: 'error',
        message: error instanceof Error ? error.message : 'Import failed. Please try again.',
      });
    }
  }

  if (!isOpen) return null;

  const confirmLabel =
    state.kind === 'preview'
      ? deferred
        ? `Queue ${state.rows.length} cards`
        : `Import ${state.rows.length} cards`
      : '…';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      onClick={handleClose}
    >
      <div
        className="flex w-full max-w-xl flex-col rounded-lg bg-white shadow-xl"
        style={{ maxHeight: 'min(90vh, 640px)' }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="shrink-0 px-6 pt-6">
          <h2 className="text-lg font-semibold text-ink-heading">Import from CSV</h2>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {state.kind === 'idle' && (
            <CsvFileSelector onFileSelect={(file) => void handleFileSelect(file)} />
          )}

          {state.kind === 'parsing' && (
            <p className="py-4 text-center text-sm text-ink-muted">Parsing file…</p>
          )}

          {state.kind === 'preview' && (
            <CsvPreviewTable rows={state.rows} skipped={state.skipped} />
          )}

          {state.kind === 'importing' && (
            <p className="py-4 text-center text-sm text-ink-muted">Importing cards…</p>
          )}

          {state.kind === 'error' && (
            <ErrorMessage message={state.message} />
          )}
        </div>

        {(state.kind === 'preview' || state.kind === 'error') && (
          <div className="shrink-0 flex justify-end gap-3 border-t border-line px-6 py-4">
            {state.kind === 'preview' && (
              <>
                <Button
                  onClick={handleClose}
                  className="rounded-[5px] border border-line px-4 py-2 text-sm text-ink-muted transition hover:bg-surface-soft"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => void handleConfirmImport()}
                  disabled={state.rows.length === 0}
                  className="rounded-[5px] bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {confirmLabel}
                </Button>
              </>
            )}

            {state.kind === 'error' && (
              <>
                <Button
                  onClick={handleClose}
                  className="rounded-[5px] border border-line px-4 py-2 text-sm text-ink-muted transition hover:bg-surface-soft"
                >
                  Close
                </Button>
                <Button
                  onClick={() => setState({ kind: 'idle' })}
                  className="rounded-[5px] bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent-hover"
                >
                  Try again
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
