import { render, screen, fireEvent } from '@testing-library/react';
import LanguageSwitcher from './LanguageSwitcher';

// Mock functions
const mockPush = jest.fn();
const mockRefresh = jest.fn();
const mockUseLocale = jest.fn();
const mockPathname = jest.fn();

// Mock next-intl (for useLocale)
jest.mock('next-intl', () => ({
  useLocale: () => mockUseLocale(),
}));

// Mock i18n navigation and config
jest.mock('@/i18n', () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  usePathname: () => mockPathname(),
  locales: ['en', 'de', 'bg'],
  localeNames: {
    en: 'English',
    de: 'Deutsch',
    bg: 'Български',
  },
}));

describe('LanguageSwitcher', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocale.mockReturnValue('en');
    mockPathname.mockReturnValue('/');
  });

  describe('Rendering', () => {
    it('renders all language buttons', () => {
      render(<LanguageSwitcher />);

      expect(screen.getByText('English')).toBeInTheDocument();
      expect(screen.getByText('Deutsch')).toBeInTheDocument();
      expect(screen.getByText('Български')).toBeInTheDocument();
    });

    it('renders correct number of buttons', () => {
      render(<LanguageSwitcher />);

      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(3);
    });

    it('marks current locale button as active', () => {
      mockUseLocale.mockReturnValue('de');

      render(<LanguageSwitcher />);

      const germanButton = screen.getByText('Deutsch');
      expect(germanButton).toHaveClass('active');
    });

    it('only one button is active at a time', () => {
      mockUseLocale.mockReturnValue('en');

      render(<LanguageSwitcher />);

      const buttons = screen.getAllByRole('button');
      const activeButtons = buttons.filter(btn => btn.classList.contains('active'));
      expect(activeButtons).toHaveLength(1);
    });

    it('has aria-label for accessibility', () => {
      render(<LanguageSwitcher />);

      expect(screen.getByLabelText('Switch to English')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to Deutsch')).toBeInTheDocument();
      expect(screen.getByLabelText('Switch to Български')).toBeInTheDocument();
    });
  });

  describe('Language Switching - From Default Locale (en)', () => {
    beforeEach(() => {
      mockUseLocale.mockReturnValue('en');
    });

    it('switches from English to German on root path', () => {
      mockPathname.mockReturnValue('/');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenCalledWith('/', { locale: 'de' });
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('switches from English to Bulgarian on root path', () => {
      mockPathname.mockReturnValue('/');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Български'));

      expect(mockPush).toHaveBeenCalledWith('/', { locale: 'bg' });
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('switches from English to German on nested path', () => {
      mockPathname.mockReturnValue('/decks');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenCalledWith('/decks', { locale: 'de' });
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('switches from English to German on deeply nested path', () => {
      mockPathname.mockReturnValue('/decks/123/cards');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenCalledWith('/decks/123/cards', { locale: 'de' });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Language Switching - From Non-Default Locale', () => {
    it('switches from German to English on root path', () => {
      mockUseLocale.mockReturnValue('de');
      mockPathname.mockReturnValue('/');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('English'));

      expect(mockPush).toHaveBeenCalledWith('/', { locale: 'en' });
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('switches from German to Bulgarian', () => {
      mockUseLocale.mockReturnValue('de');
      mockPathname.mockReturnValue('/decks');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Български'));

      expect(mockPush).toHaveBeenCalledWith('/decks', { locale: 'bg' });
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('switches from Bulgarian to German on nested path', () => {
      mockUseLocale.mockReturnValue('bg');
      mockPathname.mockReturnValue('/settings/profile');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenCalledWith('/settings/profile', { locale: 'de' });
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('switches from Bulgarian to English (default)', () => {
      mockUseLocale.mockReturnValue('bg');
      mockPathname.mockReturnValue('/about');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('English'));

      expect(mockPush).toHaveBeenCalledWith('/about', { locale: 'en' });
      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe('Same Language Click', () => {
    it('does not navigate when clicking current language', () => {
      mockUseLocale.mockReturnValue('en');
      mockPathname.mockReturnValue('/');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('English'));

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });

    it('does not navigate when clicking current German language', () => {
      mockUseLocale.mockReturnValue('de');
      mockPathname.mockReturnValue('/de/decks');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).not.toHaveBeenCalled();
      expect(mockRefresh).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('handles path without leading slash', () => {
      mockUseLocale.mockReturnValue('en');
      mockPathname.mockReturnValue('decks');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenCalledWith('decks', { locale: 'de' });
      expect(mockRefresh).toHaveBeenCalled();
    });

    it('handles root path when switching to default locale', () => {
      mockUseLocale.mockReturnValue('de');
      mockPathname.mockReturnValue('/');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('English'));

      expect(mockPush).toHaveBeenCalledWith('/', { locale: 'en' });
    });

    it('handles path with query parameters', () => {
      mockUseLocale.mockReturnValue('en');
      mockPathname.mockReturnValue('/search?q=test');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenCalledWith('/search?q=test', { locale: 'de' });
    });

    it('handles path with hash', () => {
      mockUseLocale.mockReturnValue('en');
      mockPathname.mockReturnValue('/docs#section');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenCalledWith('/docs#section', { locale: 'de' });
    });

    it('handles switching when locale is at start of path segment (but not locale prefix)', () => {
      mockUseLocale.mockReturnValue('en');
      mockPathname.mockReturnValue('/english-lessons');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenCalledWith('/english-lessons', { locale: 'de' });
    });

    it('handles empty pathname gracefully', () => {
      mockUseLocale.mockReturnValue('en');
      mockPathname.mockReturnValue('');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenCalledWith('', { locale: 'de' });
    });
  });

  describe('Accessibility', () => {
    it('all buttons are keyboard accessible', () => {
      render(<LanguageSwitcher />);

      const buttons = screen.getAllByRole('button');
      buttons.forEach(button => {
        button.focus();
        expect(button).toHaveFocus();
      });
    });

    it('buttons have proper button role', () => {
      render(<LanguageSwitcher />);

      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });

    it('active button has active class for styling', () => {
      mockUseLocale.mockReturnValue('bg');

      render(<LanguageSwitcher />);

      const bulgarianButton = screen.getByText('Български');
      expect(bulgarianButton).toHaveClass('active');
    });

    it('inactive buttons do not have active class', () => {
      mockUseLocale.mockReturnValue('en');

      render(<LanguageSwitcher />);

      const germanButton = screen.getByText('Deutsch');
      const bulgarianButton = screen.getByText('Български');

      expect(germanButton).not.toHaveClass('active');
      expect(bulgarianButton).not.toHaveClass('active');
    });
  });

  describe('Multiple Clicks', () => {
    it('handles rapid language switches', () => {
      mockUseLocale.mockReturnValue('en');
      mockPathname.mockReturnValue('/');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));
      fireEvent.click(screen.getByText('Български'));

      expect(mockPush).toHaveBeenCalledTimes(2);
      expect(mockPush).toHaveBeenNthCalledWith(1, '/', { locale: 'de' });
      expect(mockPush).toHaveBeenNthCalledWith(2, '/', { locale: 'bg' });
    });

    it('handles switching back and forth', () => {
      mockUseLocale.mockReturnValue('en');
      mockPathname.mockReturnValue('/decks');

      const { unmount } = render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('Deutsch'));

      expect(mockPush).toHaveBeenNthCalledWith(1, '/decks', { locale: 'de' });

      // Unmount and re-render with new locale
      unmount();

      // Simulate locale and pathname change after navigation
      mockUseLocale.mockReturnValue('de');
      mockPathname.mockReturnValue('/decks');

      render(<LanguageSwitcher />);

      fireEvent.click(screen.getByText('English'));

      expect(mockPush).toHaveBeenNthCalledWith(2, '/decks', { locale: 'en' });
    });
  });

  describe('Locale Detection', () => {
    it('correctly identifies current locale as English', () => {
      mockUseLocale.mockReturnValue('en');

      render(<LanguageSwitcher />);

      const englishButton = screen.getByText('English');
      expect(englishButton).toHaveClass('active');
    });

    it('correctly identifies current locale as German', () => {
      mockUseLocale.mockReturnValue('de');

      render(<LanguageSwitcher />);

      const germanButton = screen.getByText('Deutsch');
      expect(germanButton).toHaveClass('active');
    });

    it('correctly identifies current locale as Bulgarian', () => {
      mockUseLocale.mockReturnValue('bg');

      render(<LanguageSwitcher />);

      const bulgarianButton = screen.getByText('Български');
      expect(bulgarianButton).toHaveClass('active');
    });
  });

  describe('Switching TO English (default locale)', () => {
    it('switches from German to English on various paths', () => {
      const testCases = [
        { pathname: '/', locale: 'de' },
        { pathname: '/decks', locale: 'de' },
        { pathname: '/settings/profile', locale: 'de' },
      ];

      testCases.forEach(({ pathname, locale }) => {
        jest.clearAllMocks();
        mockUseLocale.mockReturnValue(locale);
        mockPathname.mockReturnValue(pathname);

        const { unmount } = render(<LanguageSwitcher />);

        fireEvent.click(screen.getByText('English'));

        expect(mockPush).toHaveBeenCalledWith(pathname, { locale: 'en' });
        expect(mockRefresh).toHaveBeenCalled();

        unmount();
      });
    });

    it('switches from Bulgarian to English on various paths', () => {
      const testCases = [
        { pathname: '/', locale: 'bg' },
        { pathname: '/decks', locale: 'bg' },
        { pathname: '/about', locale: 'bg' },
      ];

      testCases.forEach(({ pathname, locale }) => {
        jest.clearAllMocks();
        mockUseLocale.mockReturnValue(locale);
        mockPathname.mockReturnValue(pathname);

        const { unmount } = render(<LanguageSwitcher />);

        fireEvent.click(screen.getByText('English'));

        expect(mockPush).toHaveBeenCalledWith(pathname, { locale: 'en' });
        expect(mockRefresh).toHaveBeenCalled();

        unmount();
      });
    });

    it('English button is clickable and not disabled', () => {
      mockUseLocale.mockReturnValue('de');
      mockPathname.mockReturnValue('/decks');

      render(<LanguageSwitcher />);

      const englishButton = screen.getByText('English');
      expect(englishButton).not.toBeDisabled();
      expect(englishButton.tagName).toBe('BUTTON');

      // Verify clicking works
      fireEvent.click(englishButton);
      expect(mockPush).toHaveBeenCalledWith('/decks', { locale: 'en' });
    });
  });
});

