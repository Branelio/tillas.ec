// ==============================================
// Notifications Service — Firebase Cloud Messaging
// ==============================================

import api from './api';

export const notificationsService = {
  /**
   * Registrar FCM token en el backend
   */
  async registerToken(fcmToken: string): Promise<void> {
    await api.patch('/users/me', { fcmToken });
  },

  /**
   * Handler de notificaciones recibidas
   */
  handleNotification(notification: any) {
    // TODO: Implementar navegación según tipo de notificación
    console.log('Notificación recibida:', notification);
  },
};
