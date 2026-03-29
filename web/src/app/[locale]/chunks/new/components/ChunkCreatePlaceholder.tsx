type ChunkCreatePlaceholderProps = {
  deckId: string;
};

export default function ChunkCreatePlaceholder({ deckId }: ChunkCreatePlaceholderProps) {
  return (
    <div className="rounded-lg border border-[var(--border)] bg-white p-4">
      <p className="text-sm text-slate-700">
        Deck ID: <span className="font-mono">{deckId || 'not provided'}</span>
      </p>
      <p className="mt-3 text-sm text-slate-600">
        Chunk creation form will be implemented in the next step once chunks endpoints are finalized.
      </p>
    </div>
  );
}
