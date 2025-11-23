export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  translationKey: string;
  values?: Record<string, string | number>;
  duration?: number;
}

export interface NotificationProps extends Notification {
  onClose: (id: string) => void;
}


