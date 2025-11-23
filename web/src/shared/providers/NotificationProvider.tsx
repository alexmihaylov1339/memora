'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { NotificationContainer } from '@shared/components/Notification';
import type { NotificationData, NotificationType } from '@shared/components/Notification';

interface NotificationContextType {
  showNotification: (
    translationKey: string,
    type?: NotificationType,
    values?: Record<string, string | number>,
    duration?: number
  ) => void;
  success: (translationKey: string, values?: Record<string, string | number>, duration?: number) => void;
  error: (translationKey: string, values?: Record<string, string | number>, duration?: number) => void;
  info: (translationKey: string, values?: Record<string, string | number>, duration?: number) => void;
  warning: (translationKey: string, values?: Record<string, string | number>, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const showNotification = useCallback(
    (
      translationKey: string,
      type: NotificationType = 'info',
      values?: Record<string, string | number>,
      duration = 3000
    ) => {
      const id = `${Date.now()}-${Math.random()}`;
      const notification: NotificationData = {
        id,
        type,
        translationKey,
        values,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);
    },
    []
  );

  const success = useCallback(
    (translationKey: string, values?: Record<string, string | number>, duration?: number) => {
      showNotification(translationKey, 'success', values, duration);
    },
    [showNotification]
  );

  const error = useCallback(
    (translationKey: string, values?: Record<string, string | number>, duration?: number) => {
      showNotification(translationKey, 'error', values, duration);
    },
    [showNotification]
  );

  const info = useCallback(
    (translationKey: string, values?: Record<string, string | number>, duration?: number) => {
      showNotification(translationKey, 'info', values, duration);
    },
    [showNotification]
  );

  const warning = useCallback(
    (translationKey: string, values?: Record<string, string | number>, duration?: number) => {
      showNotification(translationKey, 'warning', values, duration);
    },
    [showNotification]
  );

  return (
    <NotificationContext.Provider
      value={{ showNotification, success, error, info, warning }}
    >
      {children}
      <NotificationContainer
        notifications={notifications}
        onClose={removeNotification}
      />
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
}

