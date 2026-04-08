'use client';

import { useRouter } from '@/i18n/navigation';
import { EntitySearch, ProtectedRoute } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { cardService } from '@features/decks';
import { SEARCH_QUERY_KEYS } from '@features/search';
import { CardsPageHeader } from './components';

export default function CardsPage() {
  const router = useRouter();

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <CardsPageHeader title="Cards" />
        <EntitySearch
          queryKey={SEARCH_QUERY_KEYS.card}
          search={cardService.search}
          placeholder="Search cards"
          onSelect={(item) => {
            router.replace(APP_ROUTES.cardEdit(item.id));
          }}
        />
      </main>
    </ProtectedRoute>
  );
}
