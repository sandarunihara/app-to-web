import type { Notification, NotificationPreferences, NotificationType } from '../../../types/models';
import { backendApi } from '../../../services/backendApi';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const notificationApi = {
  getNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await backendApi.get<ApiResponse<Notification[]>>('/notifications');
      return (response.data || []).sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch notifications');
    }
  },

  getUnreadNotifications: async (): Promise<Notification[]> => {
    try {
      const response = await backendApi.get<ApiResponse<Notification[]>>('/notifications/unread');
      return (response.data || []).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch unread notifications');
    }
  },

  getUnreadCount: async (): Promise<number> => {
    try {
      const response = await backendApi.get<ApiResponse<{ count: number }>>('/notifications/unread/count');
      return response.data?.count || 0;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch unread count');
    }
  },

  markAsRead: async (id: string): Promise<void> => {
    try {
      await backendApi.put(`/notifications/${id}/read`, {});
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark notification as read');
    }
  },

  markAllAsRead: async (): Promise<void> => {
    try {
      await backendApi.put('/notifications/read-all', {});
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark all as read');
    }
  },

  deleteNotification: async (id: string): Promise<void> => {
    try {
      await backendApi.delete(`/notifications/${id}`);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete notification');
    }
  },

  getPreferences: async (): Promise<NotificationPreferences> => {
    try {
      const response = await backendApi.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
      return response.data || {
        riskAlerts: true,
        testReminders: true,
        appointmentReminders: true,
        wellnessTips: true,
        learningUpdates: true,
        emailNotifications: true,
        pushNotifications: true,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch preferences');
    }
  },

  updatePreferences: async (preferences: Partial<NotificationPreferences>): Promise<NotificationPreferences> => {
    try {
      const response = await backendApi.put<ApiResponse<NotificationPreferences>>(
        '/notifications/preferences',
        preferences
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update preferences');
    }
  },

  getNotificationsByType: async (type: NotificationType): Promise<Notification[]> => {
    try {
      const response = await backendApi.get<ApiResponse<Notification[]>>(`/notifications/type/${type}`);
      return (response.data || []).sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch notifications by type');
    }
  },
};
