import type { UserProfile, HealthParameters } from '../../../types/models';
import { backendApi } from '../../../services/backendApi';

interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export const profileApi = {
  getProfile: async (): Promise<UserProfile> => {
    try {
      const response = await backendApi.get<ApiResponse<UserProfile>>('/users/me');
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch profile');
    }
  },

  updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
    try {
      const response = await backendApi.put<ApiResponse<UserProfile>>('/users/profile', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update profile');
    }
  },

  updateHealthParameters: async (data: Partial<HealthParameters>): Promise<HealthParameters> => {
    try {
      const response = await backendApi.put<ApiResponse<HealthParameters>>('/users/health-parameters', data);
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update health parameters');
    }
  },

  changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await backendApi.post<ApiResponse<{ success: boolean; message: string }>>(
        '/users/change-password',
        { currentPassword, newPassword }
      );
      // Return the wrapper response with success and message, not the data
      return {
        success: response.success ?? true,
        message: response.message || 'Password changed successfully'
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to change password');
    }
  },

  uploadProfileImage: async (file: File): Promise<UserProfile> => {
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await backendApi.post<ApiResponse<UserProfile>>(
        '/users/profile-image',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to upload image');
    }
  },

  deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
    try {
      const response = await backendApi.delete<ApiResponse<{ success: boolean; message: string }>>('/users/account');
      return response.data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete account');
    }
  },

  getHealthSummary: async () => {
    try {
      const response = await backendApi.get<ApiResponse<any>>('/users/health-summary');
      return response.data || {};
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch health summary');
    }
  },
};
