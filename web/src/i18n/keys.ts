/**
 * Translation keys constants
 * Mirrors the structure of locale JSON files
 */

export const TRANSLATION_KEYS = {
  common: {
    loading: 'common.loading',
    submit: 'common.submit',
    cancel: 'common.cancel',
    save: 'common.save',
    delete: 'common.delete',
    edit: 'common.edit',
    create: 'common.create',
    refresh: 'common.refresh',
  },
  errors: {
    generic: 'errors.generic',
    required: 'errors.required',
    networkError: 'errors.networkError',
  },
  decks: {
    title: 'decks.title',
    createTitle: 'decks.createTitle',
    deckName: 'decks.deckName',
    description: 'decks.description',
    descriptionPlaceholder: 'decks.descriptionPlaceholder',
    namePlaceholder: 'decks.namePlaceholder',
    createButton: 'decks.createButton',
    creating: 'decks.creating',
    refreshButton: 'decks.refreshButton',
    cardsCount: 'decks.cardsCount',
    createSuccess: 'decks.createSuccess',
    createError: 'decks.createError',
    deleteSuccess: 'decks.deleteSuccess',
    deleteError: 'decks.deleteError',
  },
  notifications: {
    success: 'notifications.success',
    error: 'notifications.error',
    info: 'notifications.info',
    warning: 'notifications.warning',
  },
} as const;
