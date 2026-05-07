import { useState } from 'react';

import { useNotification } from '@shared/providers';
import { TRANSLATION_KEYS } from '@/i18n';
import type { ImportCardsResponse } from '@features/decks';

export function useCardsImportModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { success } = useNotification();

  function handleOpen() {
    setIsOpen(true);
  }

  function handleClose() {
    setIsOpen(false);
  }

  function handleImportComplete(result: ImportCardsResponse) {
    if (result.skipped.length > 0) {
      success(TRANSLATION_KEYS.cards.importSuccessWithSkipped, {
        created: result.created,
        skipped: result.skipped.length,
      });
    } else {
      success(TRANSLATION_KEYS.cards.importSuccess, { created: result.created });
    }
  }

  return { isOpen, handleOpen, handleClose, handleImportComplete };
}
