export const APP_ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  account: '/account',
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  decks: '/decks',
  chunks: '/chunks/new',
  cards: '/cards/new',
  review: '/review',
  newDeck: '/decks/new',
  newCard: '/cards/new',
  newChunk: '/chunks/new',
  deckEdit: (id: string) => `/decks/${id}/edit`,
  cardEdit: (id: string) => `/cards/${id}/edit`,
  resetPasswordWithToken: (token: string) =>
    `/reset-password?token=${encodeURIComponent(token)}`,
} as const;
