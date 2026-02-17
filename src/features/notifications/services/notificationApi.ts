import { backendApi } from '../../../services/backendApi';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  timestamp?: string;
}

interface PaginationResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
}

export interface NotificationResponse {
  id: number;
  userId: number;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export const notificationApi = {
  // Get notifications for current user (matching mobile app endpoint)
  getByUserId: async (userId: number, page = 0, size = 50): Promise<NotificationResponse[]> => {
    try {
      const response = await backendApi.get<ApiResponse<PaginationResponse<NotificationResponse>>>(
        `/notifications/user/${userId}?page=${page}&size=${size}`
      );
      return response.data?.content || [];
    } catch (error: any) {
      console.error('Error fetching notifications:', error);
      return [];
    }
  },

  // Get unread count for user
  getUnreadCount: async (userId: number): Promise<number> => {
    try {
      const response = await backendApi.get<ApiResponse<number>>(
        `/notifications/user/${userId}/unread/count`
      );
      return response.data || 0;
    } catch (error: any) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Mark a notification as read
  markAsRead: async (notificationId: number): Promise<boolean> => {
    try {
      await backendApi.patch(`/notifications/${notificationId}/read`, {});
      return true;
    } catch (error: any) {
      console.error('Error marking notification as read:', error);
      return false;
    }
  },

  // Mark all notifications as read for user
  markAllAsRead: async (userId: number): Promise<boolean> => {
    try {
      await backendApi.patch(`/notifications/user/${userId}/read-all`, {});
      return true;
    } catch (error: any) {
      console.error('Error marking all as read:', error);
      return false;
    }
  },

  // Delete a notification
  delete: async (notificationId: number): Promise<boolean> => {
    try {
      await backendApi.delete(`/notifications/${notificationId}`);
      return true;
    } catch (error: any) {
      console.error('Error deleting notification:', error);
      return false;
    }
  },
};
