import { Link } from '@/i18n/navigation';

export default function EditDeckHeader() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Edit Deck</h1>

      <div className="mb-4">
        <Link href="/decks" className="text-sm text-[var(--primary)] hover:underline">
          Back to Decks
        </Link>
      </div>
    </>
  );
}
