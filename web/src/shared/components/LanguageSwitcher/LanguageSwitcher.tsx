'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { locales, localeNames } from '@/i18n';
import type { Locale } from '@/i18n';

import styles from './LanguageSwitcher.module.scss';

export default function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale() as Locale;

  const handleLanguageChange = (newLocale: Locale) => {
    if (newLocale === currentLocale) return;

    // Remove current locale from pathname if it exists
    const pathnameWithoutLocale = pathname.replace(/^\/(en|de|bg)/, '') || '/';

    // Add new locale if it's not the default
    const newPath = newLocale === 'en'
      ? pathnameWithoutLocale
      : `/${newLocale}${pathnameWithoutLocale}`;

    router.push(newPath);
    router.refresh();
  };

  return (
    <div className={styles.languageSwitcher}>
      {locales.map((locale) => (
        <button
          key={locale}
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

