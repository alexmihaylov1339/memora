import { redirect } from 'next/navigation';

interface DeckReviewRedirectPageProps {
  params: Promise<{
    id: string;
    locale: string;
  }>;
}

export default async function DeckReviewRedirectPage({
  params,
}: DeckReviewRedirectPageProps) {
  const { id, locale } = await params;

  redirect(`/${encodeURIComponent(locale)}/review?deckId=${encodeURIComponent(id)}`);
}
