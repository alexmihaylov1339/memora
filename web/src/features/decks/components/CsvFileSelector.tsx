'use client';

import { useRef } from 'react';

import { Button } from '@shared/components';

const CSV_ACCEPT_ATTRIBUTE = '.csv';

interface CsvFileSelectorProps {
  onFileSelect: (file: File) => void;
}

export function CsvFileSelector({ onFileSelect }: CsvFileSelectorProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    event.target.value = '';
  }

  return (
    <div className="flex flex-col items-center gap-4 rounded-md border-2 border-dashed border-line p-8">
      <p className="text-sm text-ink-muted">
        Select a <strong>.csv</strong> file to import cards.
      </p>
      <Button
        onClick={() => inputRef.current?.click()}
        className="rounded-[5px] bg-brand-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-accent-hover"
      >
        Select CSV file
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept={CSV_ACCEPT_ATTRIBUTE}
        className="hidden"
        onChange={handleInputChange}
      />
    </div>
  );
}
