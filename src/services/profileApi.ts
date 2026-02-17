import { backendApi } from './backendApi';
import { ENDPOINTS } from '../config/api.config';

interface ApiResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export interface HealthParameters {
    height?: number;
    weight?: number;
    bmi?: number;
    bloodType?: string;
    allergies?: string[];
    chronicConditions?: string[];
}

export interface UserProfile {
    id: number | string;
    email: string;
    firstName: string;
    lastName: string;
    phone?: string;
    dateOfBirth?: string;
    gender?: string;
    address?: string;
    nationality?: string;
    avatar?: string;
    profileImage?: string;
    role?: {
        name: string;
        permissions: string[];
    };
    healthParameters?: HealthParameters;
    weight?: number; // Top level for backward compatibility
    height?: number; // Top level for backward compatibility
    createdAt?: string;
    updatedAt?: string;
}

export const profileApi = {
    getProfile: async (): Promise<UserProfile> => {
        try {
            const response = await backendApi.get<ApiResponse<UserProfile>>(ENDPOINTS.USER.PROFILE);
            return response.data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            throw error;
        }
    },

    updateProfile: async (data: Partial<UserProfile>): Promise<UserProfile> => {
        try {
            const response = await backendApi.put<ApiResponse<UserProfile>>(ENDPOINTS.USER.UPDATE_PROFILE, data);
            return response.data;
        } catch (error) {
            console.error('Error updating profile:', error);
            throw error;
        }
    },

    updateHealthParameters: async (data: Partial<HealthParameters>): Promise<HealthParameters> => {
        try {
            const response = await backendApi.put<ApiResponse<HealthParameters>>(ENDPOINTS.USER.HEALTH_PARAMETERS, data);
            return response.data;
        } catch (error) {
            console.error('Error updating health parameters:', error);
            throw error;
        }
    },

    changePassword: async (currentPassword: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await backendApi.post<ApiResponse<{ success: boolean; message: string }>>(ENDPOINTS.USER.CHANGE_PASSWORD, {
                currentPassword,
                newPassword
            });
            // Return the wrapper response with success and message, not the data
            return {
                success: response.success ?? true,
                message: response.message || 'Password changed successfully'
            };
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },

    uploadProfileImage: async (file: File): Promise<{ success: boolean; message: string; data: UserProfile }> => {
        try {
            const formData = new FormData();
            formData.append('image', file);

            // Backend likely returns ApiResponse<UserProfile>
            const response = await backendApi.post<ApiResponse<UserProfile>>(
                ENDPOINTS.USER.UPLOAD_IMAGE,
                formData,
                {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                }
            );
            return { success: response.success, message: response.message, data: response.data };
        } catch (error) {
            console.error('Error uploading profile image:', error);
            throw error;
        }
    },

    deleteAccount: async (): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await backendApi.delete<ApiResponse<{ success: boolean; message: string }>>(ENDPOINTS.USER.DELETE_ACCOUNT);
            return response.data;
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }
};
