'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Notification from './Notification';
import type { Notification as NotificationData } from './types';

import styles from './NotificationContainer.module.scss';

interface NotificationContainerProps {
  notifications: NotificationData[];
  onClose: (id: string) => void;
}

export default function NotificationContainer({
  notifications,
  onClose,
}: NotificationContainerProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Ensure consistent rendering between server and client
  if (!mounted) return null;

  return createPortal(
    <div className={styles.container}>
      {notifications.map((notification) => (
        <Notification key={notification.id} {...notification} onClose={onClose} />
      ))}
    </div>,
    document.body
  );
}

