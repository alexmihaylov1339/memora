import { Link } from '@/i18n/navigation';
import { APP_ROUTES } from '@shared/constants';

export default function EditDeckHeader() {
  return (
    <>
      <h1 className="mb-4 text-2xl font-semibold">Edit Deck</h1>

      <div className="mb-4">
        <Link href={APP_ROUTES.decks} className="text-sm text-[var(--primary)] hover:underline">
          Back to Decks
        </Link>
      </div>
    </>
  );
}
