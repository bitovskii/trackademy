'use client';

import { useAuth } from '@/contexts/AuthContext';
import { isOwner } from '@/types/Role';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface OwnerProtectedRouteProps {
  children: React.ReactNode;
}

const OwnerProtectedRoute: React.FC<OwnerProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user && !isOwner(user.role)) {
      router.push('/');
      return;
    }
  }, [isAuthenticated, user, router]);

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/3 via-white to-secondary/3 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/95">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  if (!isOwner(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/3 via-white to-secondary/3 dark:from-gray-900/95 dark:via-gray-800/90 dark:to-gray-900/95">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-6xl mb-4">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Доступ запрещен
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Этот раздел доступен только владельцу системы. 
            Ваша роль: <span className="font-semibold text-accent">{user.role}</span>
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-hover transition-colors"
          >
            Вернуться на главную
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default OwnerProtectedRoute;
