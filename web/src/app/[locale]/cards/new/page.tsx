'use client';

import { useSearchParams } from 'next/navigation';
import { Link } from '@/i18n/navigation';
import { useRouter } from '@/i18n/navigation';

import { ProtectedRoute, FormBuilder } from '@shared/components';
import { APP_ROUTES } from '@shared/constants';
import { useCreateCardFormFields, useCreateCardMutation } from '@features/decks';

export default function NewCardPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const deckIdParam = searchParams.get('deckId')?.trim() ?? '';
  const fields = useCreateCardFormFields();

  const createCard = useCreateCardMutation({
    onSuccess: (card) => {
      router.replace(APP_ROUTES.cardEdit(card.id));
    },
  });

  const handleCreate = (values: {
    kind: string;
    front: string;
    back: string;
  }) => {
    createCard.fetch({
      deckId: deckIdParam || undefined,
      kind: values.kind.trim(),
      fields: {
        front: values.front.trim(),
        back: values.back.trim(),
      },
    });
  };

  const backHref = deckIdParam
    ? APP_ROUTES.deckEdit(deckIdParam)
    : APP_ROUTES.decks;
  const backLabel = deckIdParam ? 'Back to Deck Workspace' : 'Back to Decks';

  return (
    <ProtectedRoute>
      <main className="mx-auto w-full max-w-[1120px] px-6 py-8">
        <header className="mb-8">
          <h1 className="text-center text-4xl font-semibold text-ink-strong">
            Create Card
          </h1>
        </header>

        <div className="mx-auto flex w-full max-w-[460px] flex-col">
          <div className="mb-4">
            <Link
              href={backHref}
              className="inline-flex items-center rounded-[4px] border border-line bg-white px-2 py-1 text-[10px] font-medium text-[var(--primary)] transition hover:bg-slate-50"
            >
              {backLabel}
            </Link>
          </div>

          <div className="rounded-[4px] border border-line-soft bg-white p-3">
            <FormBuilder<{
              kind: string;
              front: string;
              back: string;
            }>
              fields={fields}
              initialValues={{
                kind: 'basic',
                front: '',
                back: '',
              }}
              onSubmit={handleCreate}
              submitLabel="Create Card"
              submitButtonClassName="mt-4 ml-auto block rounded-[4px] bg-brand-accent px-4 py-2 text-[11px] font-semibold text-white transition hover:bg-brand-accent-hover disabled:opacity-60"
              errorMessage={createCard.error?.message}
              translateFields={false}
            />
          </div>
        </div>
      </main>
    </ProtectedRoute>
  );
}
