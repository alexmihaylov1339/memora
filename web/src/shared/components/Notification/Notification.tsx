import { useEffect } from 'react';
import { Translate } from '../Translation';
import type { NotificationProps } from './types';

import styles from './Notification.module.scss';

export default function Notification({
  id,
  type,
  translationKey,
  values,
  duration = 3000,
  onClose,
}: NotificationProps) {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  return (
    <div className={`${styles.notification} ${styles[type]}`}>
      <Translate tKey={translationKey} values={values} as="p" className={styles.message} />
      <button
        className={styles.closeButton}
        onClick={() => onClose(id)}
        aria-label="Close notification"
      >
        ×
      </button>
    </div>
  );
}

