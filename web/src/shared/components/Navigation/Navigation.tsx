'use client';

import { Link } from '@/i18n/navigation';

import { useAuth } from '@/shared/components/AuthProvider';
import { APP_ROUTES } from '@/shared/constants';
import { useLogout } from '@/shared/hooks/useLogout';

export default function Navigation() {
  const { isAuthenticated, isReady } = useAuth();
  const logout = useLogout();

  return (
    <nav className="w-full flex justify-between items-center p-4 bg-gray-100 border-b border-gray-200">
      <div className="flex space-x-4">
        {isReady &&
          (isAuthenticated ? (
            <>
              <Link href={APP_ROUTES.home}>
                <span className="text-blue-600 hover:underline">Home</span>
              </Link>
              <Link href={APP_ROUTES.decks}>
                <span className="text-blue-600 hover:underline">Decks</span>
              </Link>
              <Link href={APP_ROUTES.account}>
                <span className="text-blue-600 hover:underline">Account</span>
              </Link>
              <button
                type="button"
                onClick={logout}
                className="text-blue-600 hover:underline bg-transparent border-none cursor-pointer p-0 font-inherit"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href={APP_ROUTES.login}>
                <span className="text-blue-600 hover:underline">Login</span>
              </Link>
              <Link href={APP_ROUTES.register}>
                <span className="text-blue-600 hover:underline">Register</span>
              </Link>
            </>
          ))}
      </div>
    </nav>
  );
}
