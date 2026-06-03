import { redirect } from 'next/navigation';

import { APP_ROUTES } from '@/shared/constants/routes';

interface HomePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;

  redirect(`/${encodeURIComponent(locale)}${APP_ROUTES.decks}`);
}
