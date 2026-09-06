/**
 * Multi-Channel Notification Adapter Boundary
 * Prepares channels for In-App, WhatsApp, SMS, and Push alerts.
 */

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP';

export interface DispatchNotificationOptions {
  organizationId: string;
  recipientId: string;
  recipientContact: {
    email?: string;
    phone?: string;
  };
  channels: NotificationChannel[];
  title: string;
  message: string;
  actionUrl?: string;
}

export interface INotificationDispatcher {
  dispatch(options: DispatchNotificationOptions): Promise<{ channelResults: Record<NotificationChannel, boolean> }>;
}
