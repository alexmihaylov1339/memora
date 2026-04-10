import { useEffect, useState } from 'react';

const GRID_QUICK_FILTER_DEBOUNCE_MS = 200;

export default function useGridQuickFilter() {
  const [quickFilterText, setQuickFilterText] = useState('');
  const [debouncedQuickFilterText, setDebouncedQuickFilterText] = useState('');

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedQuickFilterText(quickFilterText.trim().toLowerCase());
    }, GRID_QUICK_FILTER_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [quickFilterText]);

  return {
    quickFilterText,
    setQuickFilterText,
    debouncedQuickFilterText,
  };
}
