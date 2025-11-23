'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname, locales, localeNames } from '@/i18n';
import type { Locale } from '@/i18n';

import styles from './LanguageSwitcher.module.scss';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    // Use next-intl's router which handles locale switching automatically
    router.push(pathname, { locale: newLocale });
    router.refresh();
  };

  return (
    <div className={styles.languageSwitcher}>
      {locales.map((locale) => (
        <button
          key={locale}
          type="button"
          onClick={() => handleLanguageChange(locale)}
          className={`${styles.languageButton} ${
            currentLocale === locale ? styles.active : ''
          }`}
          aria-label={`Switch to ${localeNames[locale]}`}
        >
          {localeNames[locale]}
        </button>
      ))}
    </div>
  );
}

