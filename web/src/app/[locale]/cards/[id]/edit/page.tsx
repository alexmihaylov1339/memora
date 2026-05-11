'use client';

import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/navigation';

import { TRANSLATION_KEYS } from '@/i18n';
import {
  ErrorMessage,
  PageLoader,
  ProtectedRoute,
} from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import {
  useCardDetailQuery,
  useDeleteCardMutation,
  useDecksListQuery,
  useUpdateCardMutation,
} from '@features/decks';
import { CardsPageHeader } from '../../components';
import { resolveSingleParam } from '@/shared/utils';
import EditCardForm from './components/EditCardForm';

export default function EditCardPage() {
  const t = useTranslations();
  const params = useParams();
  const router = useRouter();
  const id = resolveSingleParam(params?.id as string | string[] | undefined);

  const cardQuery = useCardDetailQuery(id);
  const decksQuery = useDecksListQuery();

  const updateCard = useUpdateCardMutation({
    onSuccess: () => {
      cardQuery.refetch();
    },
  });

  const deleteCard = useDeleteCardMutation({
    onSuccess: () => {
      router.replace(APP_ROUTES.cards);
    },
  });

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-2xl p-6">
        <CardsPageHeader title={t(TRANSLATION_KEYS.cards.editTitle)} />

        {cardQuery.isLoading && <PageLoader />}
        {cardQuery.error && <ErrorMessage message={cardQuery.error.message} />}
        {decksQuery.isLoading && <PageLoader />}
        {decksQuery.error && <ErrorMessage message={decksQuery.error.message} />}

        {cardQuery.result && decksQuery.result && (
          <EditCardForm
            key={cardQuery.result.id}
            card={cardQuery.result}
            decks={decksQuery.result}
            onUpdate={(payload) => updateCard.fetch(payload)}
            onDelete={() => deleteCard.fetch({ id })}
            updateError={updateCard.error?.message}
            deleteError={deleteCard.error?.message}
            isDeleting={deleteCard.isLoading}
          />
        )}
      </main>
    </ProtectedRoute>
  );
}
